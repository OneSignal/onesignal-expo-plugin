/**
 * Expo config plugin for One Signal (iOS)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} from "@expo/config-plugins";
import * as fs from 'fs';
import xcode from 'xcode';
import {
  DEFAULT_BUNDLE_SHORT_VERSION,
  DEFAULT_BUNDLE_VERSION,
  IPHONEOS_DEPLOYMENT_TARGET,
  NSE_TARGET_NAME,
  TARGETED_DEVICE_FAMILY
} from "../support/iosConstants";
import { updatePodfile } from "../support/updatePodfile";
import NseUpdaterManager from "../support/NseUpdaterManager";
import { OneSignalLog } from "../support/OneSignalLog";
import { FileManager } from "../support/FileManager";
import { OneSignalPluginProps, PluginOptions } from "../types/types";
import assert from 'assert';
import getEasManagedCredentialsConfigExtra from "../support/eas/getEasManagedCredentialsConfigExtra";
import { ExpoConfig } from '@expo/config-types';

/**
 * Add 'aps-environment' record with current environment to '<project-name>.entitlements' file
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withAppEnvironment: ConfigPlugin<OneSignalPluginProps> = (
  config,
  onesignalProps
) => {
  return withEntitlementsPlist(config, (newConfig) => {
    if (onesignalProps?.mode == null) {
      throw new Error(`
        Missing required "mode" key in your app.json or app.config.js file for "onesignal-expo-plugin".
        "mode" can be either "development" or "production".
        Please see onesignal-expo-plugin's README.md for more details.`
      )
    }
    newConfig.modResults["aps-environment"] = onesignalProps.mode;
    return newConfig;
  });
};

/**
 * Add "Background Modes -> Remote notifications" and "App Group" permissions
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withRemoteNotificationsPermissions: ConfigPlugin<OneSignalPluginProps> = (
  config
) => {
  const BACKGROUND_MODE_KEYS = ["remote-notification"];
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
const withAppGroupPermissions: ConfigPlugin<OneSignalPluginProps> = (
  config
) => {
  const APP_GROUP_KEY = "com.apple.security.application-groups";
  return withEntitlementsPlist(config, newConfig => {
    if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
      newConfig.modResults[APP_GROUP_KEY] = [];
    }
    const modResultsArray = (newConfig.modResults[APP_GROUP_KEY] as Array<any>);
    const entitlement = `group.${newConfig?.ios?.bundleIdentifier || ""}.onesignal`;
    if (modResultsArray.indexOf(entitlement) !== -1) {
      return newConfig;
    }
    modResultsArray.push(entitlement);

    return newConfig;
  });
};

const withOneSignalNSE: ConfigPlugin<OneSignalPluginProps> = (config, onesignalProps) => {
  return withXcodeProject(config, async props => {
    const options: PluginOptions = {
      iosPath: props.modRequest.platformProjectRoot,
      bundleIdentifier: props.ios?.bundleIdentifier,
      devTeam: onesignalProps?.devTeam,
      bundleVersion: props.ios?.buildNumber,
      bundleShortVersion: props?.version,
      mode: onesignalProps?.mode,
      iPhoneDeploymentTarget: onesignalProps?.iPhoneDeploymentTarget
    };

    // support for monorepos where node_modules can be up to 5 parents
    // above the project directory.
    let dir = "node_modules"
    for(let x=0; x < 5 && !FileManager.dirExists(dir); x++) {
      dir = "../" + dir
    }

    xcodeProjectAddNse(
      props.modRequest.projectName || "",
      options,
      dir + "/onesignal-expo-plugin/build/support/serviceExtensionFiles/"
    );

    return props;
  });
}

const withEasManagedCredentials: ConfigPlugin<OneSignalPluginProps> = (config) => {
  assert(config.ios?.bundleIdentifier, "Missing 'ios.bundleIdentifier' in app config.")
  config.extra = getEasManagedCredentialsConfigExtra(config as ExpoConfig);
  return config;
}

export const withOneSignalIos: ConfigPlugin<OneSignalPluginProps> = (
  config,
  props
) => {
  withAppEnvironment(config, props);
  withRemoteNotificationsPermissions(config, props);
  withAppGroupPermissions(config, props);
  withOneSignalNSE(config, props);
  withEasManagedCredentials(config, props);
  return config;
};

export function xcodeProjectAddNse(
  appName: string,
  options: PluginOptions,
  sourceDir: string
): void {
  const { iosPath, devTeam, bundleIdentifier, bundleVersion, bundleShortVersion, iPhoneDeploymentTarget } = options;

  // not awaiting in order to not block main thread
  updatePodfile(iosPath).catch(err => { OneSignalLog.error(err) });

  const projPath = `${iosPath}/${appName}.xcodeproj/project.pbxproj`;

  const extFiles = [
    "NotificationService.h",
    "NotificationService.m",
    `${NSE_TARGET_NAME}.entitlements`,
    `${NSE_TARGET_NAME}-Info.plist`
  ];

  const xcodeProject = xcode.project(projPath);

  xcodeProject.parse(async function(err: Error) {
    if (err) {
      OneSignalLog.log(`Error parsing iOS project: ${JSON.stringify(err)}`);
      return;
    }

    /* COPY OVER EXTENSION FILES */
    fs.mkdirSync(`${iosPath}/${NSE_TARGET_NAME}`, { recursive: true });

    for (let i = 0; i < extFiles.length; i++) {
      const extFile = extFiles[i];
      const targetFile = `${iosPath}/${NSE_TARGET_NAME}/${extFile}`;
      await FileManager.copyFile(`${sourceDir}${extFile}`, targetFile);
    }

    /* MODIFY COPIED EXTENSION FILES */
    const nseUpdater = new NseUpdaterManager(iosPath);
    await nseUpdater.updateNSEEntitlements(`group.${bundleIdentifier}.onesignal`)
    await nseUpdater.updateNSEBundleVersion(bundleVersion ?? DEFAULT_BUNDLE_VERSION);
    await nseUpdater.updateNSEBundleShortVersion(bundleShortVersion ?? DEFAULT_BUNDLE_SHORT_VERSION);

    // Create new PBXGroup for the extension
    const extGroup = xcodeProject.addPbxGroup(extFiles, NSE_TARGET_NAME, NSE_TARGET_NAME);

    // Add the new PBXGroup to the top level group. This makes the
    // files / folder appear in the file explorer in Xcode.
    const groups = xcodeProject.hash.project.objects["PBXGroup"];
    Object.keys(groups).forEach(function(key) {
      if (groups[key].name === undefined) {
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

    if (!!xcodeProject.pbxTargetByName(NSE_TARGET_NAME)) {
      OneSignalLog.log(`${NSE_TARGET_NAME} already exists in project. Skipping...`);
      return;
    }

    // Add the NSE target
    // This adds PBXTargetDependency and PBXContainerItemProxy for you
    const nseTarget = xcodeProject.addTarget(NSE_TARGET_NAME, "app_extension", NSE_TARGET_NAME, `${bundleIdentifier}.${NSE_TARGET_NAME}`);

    // Add build phases to the new target
    xcodeProject.addBuildPhase(
      ["NotificationService.m"],
      "PBXSourcesBuildPhase",
      "Sources",
      nseTarget.uuid
    );
    xcodeProject.addBuildPhase([], "PBXResourcesBuildPhase", "Resources", nseTarget.uuid);

    xcodeProject.addBuildPhase(
      [],
      "PBXFrameworksBuildPhase",
      "Frameworks",
      nseTarget.uuid
    );

    // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
    // However, can be more
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in configurations) {
      if (
        typeof configurations[key].buildSettings !== "undefined" &&
        configurations[key].buildSettings.PRODUCT_NAME == `"${NSE_TARGET_NAME}"`
      ) {
        const buildSettingsObj = configurations[key].buildSettings;
        buildSettingsObj.DEVELOPMENT_TEAM = devTeam;
        buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = iPhoneDeploymentTarget ?? IPHONEOS_DEPLOYMENT_TARGET;
        buildSettingsObj.TARGETED_DEVICE_FAMILY = TARGETED_DEVICE_FAMILY;
        buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${NSE_TARGET_NAME}/${NSE_TARGET_NAME}.entitlements`;
        buildSettingsObj.CODE_SIGN_STYLE = "Automatic";
      }
    }

    // Add development teams to both your target and the original project
    xcodeProject.addTargetAttribute("DevelopmentTeam", devTeam, nseTarget);
    xcodeProject.addTargetAttribute("DevelopmentTeam", devTeam);

    fs.writeFileSync(projPath, xcodeProject.writeSync());
  })
}
