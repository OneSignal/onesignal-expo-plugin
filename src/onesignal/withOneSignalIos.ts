/**
 * Expo config plugin for One Signal (iOS)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  ConfigPlugin,
  IOSConfig,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
  withDangerousMod,
} from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';

import getEasManagedCredentialsConfigExtra from '../support/eas/getEasManagedCredentialsConfigExtra';
import { FileManager } from '../support/FileManager';
import { getAppGroupIdentifier, resolveDevTeam, resolveNseConfig } from '../support/helpers';
import {
  DEFAULT_BUNDLE_SHORT_VERSION,
  DEFAULT_BUNDLE_VERSION,
  IPHONEOS_DEPLOYMENT_TARGET,
  NSE_TARGET_NAME,
  NSE_EXT_FILES,
  TARGETED_DEVICE_FAMILY,
} from '../support/iosConstants';
import NseUpdaterManager from '../support/NseUpdaterManager';
import { OneSignalLog } from '../support/OneSignalLog';
import { updatePodfile } from '../support/updatePodfile';
import { OneSignalPluginProps } from '../types/types';
import { withOneSignalLiveActivity } from './withOneSignalLiveActivity';

/**
 * Add 'aps-environment' record with current environment to '<project-name>.entitlements' file
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withAppEnvironment: ConfigPlugin<OneSignalPluginProps> = (config, onesignalProps) => {
  return withEntitlementsPlist(config, (newConfig) => {
    if (onesignalProps?.mode == null) {
      throw new Error(`
        Missing required "mode" key in your app.json or app.config.js file for "onesignal-expo-plugin".
        "mode" can be either "development" or "production".
        Please see onesignal-expo-plugin's README.md for more details.`);
    }
    newConfig.modResults['aps-environment'] = onesignalProps.mode;
    return newConfig;
  });
};

/**
 * Add "Background Modes -> Remote notifications" and "App Group" permissions
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withRemoteNotificationsPermissions: ConfigPlugin<OneSignalPluginProps> = (config) => {
  const BACKGROUND_MODE_KEYS = ['remote-notification'];
  return withInfoPlist(config, (newConfig) => {
    if (!Array.isArray(newConfig.modResults.UIBackgroundModes)) {
      newConfig.modResults.UIBackgroundModes = [];
    }
    for (const key of BACKGROUND_MODE_KEYS) {
      if (!newConfig.modResults.UIBackgroundModes.includes(key)) {
        newConfig.modResults.UIBackgroundModes.push(key);
      }
    }

    return newConfig;
  });
};

/**
 * Add "App Group" permission
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps (step 4.4)
 */
const withAppGroupPermissions: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  const APP_GROUP_KEY = 'com.apple.security.application-groups';
  return withEntitlementsPlist(config, (newConfig) => {
    if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
      newConfig.modResults[APP_GROUP_KEY] = [];
    }
    const modResultsArray = newConfig.modResults[APP_GROUP_KEY] as Array<any>;
    const entitlement = getAppGroupIdentifier(
      newConfig?.ios?.bundleIdentifier || '',
      props?.appGroupName,
    );
    if (modResultsArray.indexOf(entitlement) !== -1) {
      return newConfig;
    }
    modResultsArray.push(entitlement);

    return newConfig;
  });
};

/**
 * Add OneSignal_app_groups_key to Info.plist when a custom app group name is provided.
 * @see https://documentation.onesignal.com/docs/ios-sdk-setup#step-3-create-an-app-group
 */
const withCustomAppGroupsKey: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  return withInfoPlist(config, (newConfig) => {
    if (props?.appGroupName) {
      newConfig.modResults.OneSignal_app_groups_key = props.appGroupName;
    }
    return newConfig;
  });
};

const withEasManagedCredentials: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  if (!config.ios?.bundleIdentifier) {
    return config;
  }
  config.extra = getEasManagedCredentialsConfigExtra(
    config as ExpoConfig,
    props?.appGroupName,
    props?.nseBundleIdentifier,
    props?.liveActivities,
    props?.disableNSE,
  );
  return config;
};

const withOneSignalPodfile: ConfigPlugin<OneSignalPluginProps> = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosRoot = path.join(config.modRequest.projectRoot, 'ios');
      await updatePodfile(iosRoot);
      return config;
    },
  ]);
};

const withOneSignalNSE: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      // support for monorepos where node_modules can be above the project directory.
      const pluginDir = require.resolve('onesignal-expo-plugin/package.json');
      const sourceDir = path.join(pluginDir, '../serviceExtensionFiles/');
      const iosPath = path.join(config.modRequest.projectRoot, 'ios');
      /* COPY OVER EXTENSION FILES */
      fs.mkdirSync(`${iosPath}/${NSE_TARGET_NAME}`, {
        recursive: true,
      });

      for (const file of NSE_EXT_FILES) {
        const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${file}`;
        await FileManager.copyFile(`${sourceDir}${file}`, targetFile);
      }

      const nseConfig = resolveNseConfig(props.iosNSEFilePath);
      const sourcePath = props.iosNSEFilePath ?? `${sourceDir}${nseConfig.sourceFile}`;
      const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${nseConfig.sourceFile}`;
      await FileManager.copyFile(`${sourcePath}`, targetFile);

      // ObjC NSE needs a paired header. Prefer a sibling next to the customer's .m so they
      // can override the default; fall back to the shipped template (matches pre-Swift behavior
      // where the .h was always supplied by the plugin).
      if (nseConfig.headerFile) {
        const siblingHeader = props.iosNSEFilePath
          ? path.join(path.dirname(props.iosNSEFilePath), nseConfig.headerFile)
          : undefined;
        const headerSource =
          siblingHeader && fs.existsSync(siblingHeader)
            ? siblingHeader
            : `${sourceDir}${nseConfig.headerFile}`;
        const headerTarget = `${iosPath}/${NSE_TARGET_NAME}/${nseConfig.headerFile}`;
        await FileManager.copyFile(headerSource, headerTarget);
      }

      /* MODIFY COPIED EXTENSION FILES */
      const nseUpdater = new NseUpdaterManager(iosPath);
      const appGroupId = getAppGroupIdentifier(
        config.ios?.bundleIdentifier ?? '',
        props.appGroupName,
      );
      await nseUpdater.updateNSEEntitlements(appGroupId);
      await nseUpdater.updateNSEPrincipalClass(nseConfig.principalClass);
      if (props.appGroupName) {
        await nseUpdater.updateNSEInfoPlistAppGroupKey(props.appGroupName);
      }
      await nseUpdater.updateNSEBundleVersion(config.ios?.buildNumber ?? DEFAULT_BUNDLE_VERSION);
      await nseUpdater.updateNSEBundleShortVersion(config?.version ?? DEFAULT_BUNDLE_SHORT_VERSION);

      return config;
    },
  ]);
};

export { resolveDevTeam } from '../support/helpers';

const withOneSignalXcodeProject: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  return withXcodeProject(config, (newConfig) => {
    const xcodeProject = newConfig.modResults;
    const nseBundleId = `${config.ios?.bundleIdentifier}.${
      props.nseBundleIdentifier ?? NSE_TARGET_NAME
    }`;

    const devTeam = resolveDevTeam(config, props);
    const nseConfig = resolveNseConfig(props.iosNSEFilePath);
    // Header (if any) belongs in the group for navigation but not in Sources phase — it's compiled implicitly via #import.
    const groupFiles = [
      ...NSE_EXT_FILES,
      nseConfig.sourceFile,
      ...(nseConfig.headerFile ? [nseConfig.headerFile] : []),
    ];

    if (xcodeProject.pbxTargetByName(NSE_TARGET_NAME)) {
      OneSignalLog.log(`${NSE_TARGET_NAME} already exists in project. Skipping...`);
      return newConfig;
    }

    const extGroup = xcodeProject.addPbxGroup(groupFiles, NSE_TARGET_NAME, NSE_TARGET_NAME);

    // Add the new PBXGroup to the top level group. This makes the
    // files / folder appear in the file explorer in Xcode.
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

    // WORK AROUND for codeProject.addTarget BUG
    // Xcode projects don't contain these if there is only one target
    // An upstream fix should be made to the code referenced in this link:
    //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
    const projObjects = xcodeProject.hash.project.objects;
    projObjects['PBXTargetDependency'] = projObjects['PBXTargetDependency'] || {};
    projObjects['PBXContainerItemProxy'] = projObjects['PBXTargetDependency'] || {};

    // Add the NSE target
    // This adds PBXTargetDependency and PBXContainerItemProxy for you
    const nseTarget = xcodeProject.addTarget(
      NSE_TARGET_NAME,
      'app_extension',
      NSE_TARGET_NAME,
      nseBundleId,
    );

    xcodeProject.addBuildPhase(
      [nseConfig.sourceFile],
      'PBXSourcesBuildPhase',
      'Sources',
      nseTarget.uuid,
    );
    xcodeProject.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', nseTarget.uuid);

    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', nseTarget.uuid);

    // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
    // However, can be more
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      if (
        typeof configurations[key].buildSettings !== 'undefined' &&
        configurations[key].buildSettings.PRODUCT_NAME == `"${NSE_TARGET_NAME}"`
      ) {
        const buildSettingsObj = configurations[key].buildSettings;
        buildSettingsObj.DEVELOPMENT_TEAM = devTeam;
        buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET =
          props?.iPhoneDeploymentTarget ?? IPHONEOS_DEPLOYMENT_TARGET;
        buildSettingsObj.TARGETED_DEVICE_FAMILY = TARGETED_DEVICE_FAMILY;
        buildSettingsObj.SWIFT_VERSION = '5.0';
        buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NSE_TARGET_NAME}/${NSE_TARGET_NAME}.entitlements`;
        buildSettingsObj.CODE_SIGN_STYLE = 'Automatic';
      }
    }

    // Add development teams to both your target and the original project
    xcodeProject.addTargetAttribute('DevelopmentTeam', devTeam, nseTarget);
    xcodeProject.addTargetAttribute('DevelopmentTeam', devTeam);
    return newConfig;
  });
};

const withSoundFiles: ConfigPlugin<OneSignalPluginProps> = (config, onesignalProps) => {
  if (!onesignalProps.sounds) {
    return config;
  }

  return withXcodeProject(config, (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const projectName = config.modRequest.projectName!;
    const sourceRoot = IOSConfig.Paths.getSourceRoot(projectRoot);
    let project = config.modResults;

    for (const soundFile of onesignalProps.sounds!) {
      const fileName = path.basename(soundFile);
      const sourcePath = path.resolve(projectRoot, soundFile);
      const destPath = path.resolve(sourceRoot, fileName);

      OneSignalLog.log(`Copying sound file ${soundFile} to iOS project`);
      fs.copyFileSync(sourcePath, destPath);

      if (!project.hasFile(`${projectName}/${fileName}`)) {
        project = IOSConfig.XcodeUtils.addResourceFileToGroup({
          filepath: `${projectName}/${fileName}`,
          groupName: projectName,
          project,
          isBuildFile: true,
        });
      }
    }

    config.modResults = project;
    return config;
  });
};

export const withOneSignalIos: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  config = withAppEnvironment(config, props);
  config = withRemoteNotificationsPermissions(config, props);
  if (!props.disableNSE) {
    config = withCustomAppGroupsKey(config, props);
    config = withAppGroupPermissions(config, props);
    config = withOneSignalPodfile(config, props);
    config = withOneSignalNSE(config, props);
    config = withOneSignalXcodeProject(config, props);
  }
  config = withSoundFiles(config, props);
  if (props.liveActivities) {
    config = withOneSignalLiveActivity(config, props);
  }
  // EAS extras must run after every target that contributes an appExtension entry
  // so disableNSE + liveActivities still registers the widget target.
  if (!props.disableNSE || props.liveActivities) {
    config = withEasManagedCredentials(config, props);
  }
  return config;
};
