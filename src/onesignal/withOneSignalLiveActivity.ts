/**
 * Expo config plugin that scaffolds an iOS Widget Extension target for OneSignal Live Activities.
 * @see https://documentation.onesignal.com/docs/cross-platform-live-activity-setup
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  ConfigPlugin,
  withInfoPlist,
  withXcodeProject,
  withDangerousMod,
} from '@expo/config-plugins';

import { FileManager } from '../support/FileManager';
import { resolveDevTeam } from '../support/helpers';
import {
  BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
  BUNDLE_VERSION_TEMPLATE_REGEX,
  DEFAULT_BUNDLE_SHORT_VERSION,
  DEFAULT_BUNDLE_VERSION,
  LIVE_ACTIVITY_BUNDLE_FILE,
  LIVE_ACTIVITY_DEPLOYMENT_TARGET,
  LIVE_ACTIVITY_INFO_PLIST_FILE,
  LIVE_ACTIVITY_TARGET_NAME,
  LIVE_ACTIVITY_WIDGET_FILE,
  TARGETED_DEVICE_FAMILY,
  liveActivityPodfileRegex,
  liveActivityPodfileSnippet,
} from '../support/iosConstants';
import { OneSignalLog } from '../support/OneSignalLog';
import { OneSignalPluginProps } from '../types/types';

/** Resolve the widget extension target name, defaulting when unset. */
export function resolveLiveActivityTargetName(props: OneSignalPluginProps): string {
  return props.liveActivities?.targetName ?? LIVE_ACTIVITY_TARGET_NAME;
}

/** Build the widget extension's full bundle identifier. */
export function resolveLiveActivityBundleId(
  bundleIdentifier: string,
  props: OneSignalPluginProps,
): string {
  const suffix =
    props.liveActivities?.bundleIdentifierSuffix ?? resolveLiveActivityTargetName(props);
  return `${bundleIdentifier}.${suffix}`;
}

/** Resolve the IPHONEOS_DEPLOYMENT_TARGET for the widget target (must be >= 16.2). */
export function resolveLiveActivityDeploymentTarget(props: OneSignalPluginProps): string {
  const requested = props.liveActivities?.deploymentTarget;
  if (!requested) {
    return LIVE_ACTIVITY_DEPLOYMENT_TARGET;
  }

  const requestedNum = parseFloat(requested);
  const minNum = parseFloat(LIVE_ACTIVITY_DEPLOYMENT_TARGET);
  if (Number.isFinite(requestedNum) && requestedNum < minNum) {
    OneSignalLog.log(
      `Warning: liveActivities.deploymentTarget "${requested}" is below the minimum required for Live Activities (${LIVE_ACTIVITY_DEPLOYMENT_TARGET}). The widget extension will use ${LIVE_ACTIVITY_DEPLOYMENT_TARGET}.`,
    );
    return LIVE_ACTIVITY_DEPLOYMENT_TARGET;
  }
  return requested;
}

/** Add NSSupportsLiveActivities=true to the main target's Info.plist. */
const withLiveActivityInfoPlist: ConfigPlugin<OneSignalPluginProps> = (config) => {
  return withInfoPlist(config, (newConfig) => {
    newConfig.modResults.NSSupportsLiveActivities = true;
    return newConfig;
  });
};

/** Append a Widget Extension target block to the Podfile (idempotent). */
const withLiveActivityPodfile: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const targetName = resolveLiveActivityTargetName(props);
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      const podfile = await FileManager.readFile(podfilePath);

      if (liveActivityPodfileRegex(targetName).test(podfile)) {
        OneSignalLog.log(`${targetName} target already added to Podfile. Skipping...`);
        return config;
      }

      await fs.promises.appendFile(podfilePath, liveActivityPodfileSnippet(targetName));
      OneSignalLog.log(`${targetName} target added to Podfile.`);
      return config;
    },
  ]);
};

/** Copy widget extension template files (or the user-supplied widget file) into the iOS project. */
const withLiveActivityFiles: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const targetName = resolveLiveActivityTargetName(props);
      const pluginDir = require.resolve('onesignal-expo-plugin/package.json');
      const sourceDir = path.join(pluginDir, '../widgetExtensionFiles/');
      const iosPath = path.join(config.modRequest.projectRoot, 'ios');
      const targetDir = path.join(iosPath, targetName);

      fs.mkdirSync(targetDir, { recursive: true });

      const bundleSource = path.join(sourceDir, LIVE_ACTIVITY_BUNDLE_FILE);
      const bundleTarget = path.join(targetDir, LIVE_ACTIVITY_BUNDLE_FILE);
      await FileManager.copyFile(bundleSource, bundleTarget);

      const widgetSource =
        props.liveActivities?.widgetFilePath ?? path.join(sourceDir, LIVE_ACTIVITY_WIDGET_FILE);
      const widgetTarget = path.join(targetDir, LIVE_ACTIVITY_WIDGET_FILE);
      await FileManager.copyFile(widgetSource, widgetTarget);

      const plistSource = path.join(sourceDir, LIVE_ACTIVITY_INFO_PLIST_FILE);
      const plistTarget = path.join(targetDir, `${targetName}-Info.plist`);
      let plistContents = await FileManager.readFile(plistSource);
      plistContents = plistContents.replace(
        BUNDLE_VERSION_TEMPLATE_REGEX,
        config.ios?.buildNumber ?? DEFAULT_BUNDLE_VERSION,
      );
      plistContents = plistContents.replace(
        BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
        config.version ?? DEFAULT_BUNDLE_SHORT_VERSION,
      );
      await FileManager.writeFile(plistTarget, plistContents);

      return config;
    },
  ]);
};

/** Register the widget extension target, group, build phases, and build settings in the Xcode project. */
const withLiveActivityXcodeProject: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  return withXcodeProject(config, (newConfig) => {
    const xcodeProject = newConfig.modResults;
    const targetName = resolveLiveActivityTargetName(props);
    const widgetBundleId = resolveLiveActivityBundleId(config.ios?.bundleIdentifier ?? '', props);
    const deploymentTarget = resolveLiveActivityDeploymentTarget(props);
    const devTeam = resolveDevTeam(config as Parameters<typeof resolveDevTeam>[0], props);

    if (xcodeProject.pbxTargetByName(targetName)) {
      OneSignalLog.log(`${targetName} already exists in project. Skipping...`);
      return newConfig;
    }

    const widgetFiles = [
      LIVE_ACTIVITY_BUNDLE_FILE,
      LIVE_ACTIVITY_WIDGET_FILE,
      `${targetName}-Info.plist`,
    ];

    const extGroup = xcodeProject.addPbxGroup(widgetFiles, targetName, targetName);

    const groups = xcodeProject.hash.project.objects['PBXGroup'];
    Object.keys(groups).forEach(function (key) {
      if (
        typeof groups[key] === 'object' &&
        groups[key].name === undefined &&
        groups[key].path === undefined
      ) {
        xcodeProject.addToPbxGroup(extGroup.uuid, key);
      }
    });

    const projObjects = xcodeProject.hash.project.objects;
    projObjects['PBXTargetDependency'] = projObjects['PBXTargetDependency'] || {};
    projObjects['PBXContainerItemProxy'] = projObjects['PBXContainerItemProxy'] || {};

    const widgetTarget = xcodeProject.addTarget(
      targetName,
      'app_extension',
      targetName,
      widgetBundleId,
    );

    xcodeProject.addBuildPhase(
      [LIVE_ACTIVITY_BUNDLE_FILE, LIVE_ACTIVITY_WIDGET_FILE],
      'PBXSourcesBuildPhase',
      'Sources',
      widgetTarget.uuid,
    );
    xcodeProject.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', widgetTarget.uuid);
    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', widgetTarget.uuid);

    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      if (
        typeof configurations[key].buildSettings !== 'undefined' &&
        configurations[key].buildSettings.PRODUCT_NAME == `"${targetName}"`
      ) {
        const buildSettingsObj = configurations[key].buildSettings;
        buildSettingsObj.DEVELOPMENT_TEAM = devTeam;
        buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = deploymentTarget;
        buildSettingsObj.TARGETED_DEVICE_FAMILY = TARGETED_DEVICE_FAMILY;
        buildSettingsObj.SWIFT_VERSION = '5.0';
        buildSettingsObj.INFOPLIST_FILE = `${targetName}/${targetName}-Info.plist`;
        buildSettingsObj.CODE_SIGN_STYLE = 'Automatic';
      }
    }

    if (devTeam) {
      xcodeProject.addTargetAttribute('DevelopmentTeam', devTeam, widgetTarget);
      xcodeProject.addTargetAttribute('DevelopmentTeam', devTeam);
    }

    return newConfig;
  });
};

export const withOneSignalLiveActivity: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  if (!props.liveActivities) {
    return config;
  }
  config = withLiveActivityInfoPlist(config, props);
  config = withLiveActivityPodfile(config, props);
  config = withLiveActivityFiles(config, props);
  config = withLiveActivityXcodeProject(config, props);
  return config;
};
