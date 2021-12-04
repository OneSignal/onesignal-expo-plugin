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
import { OneSignalPluginProps } from "./withOneSignal";
import fs from 'fs';
import xcode from 'xcode';
import { IPHONEOS_DEPLOYMENT_TARGET, TARGETED_DEVICE_FAMILY } from "../support/iosConstants";
import { addTargetDependency } from "./temp";

// ---------- ---------- ---------- ----------

/**
 * Add 'app-environment' record with current environment to '<project-name>.entitlements' file
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withAppEnvironment: ConfigPlugin<OneSignalPluginProps> = (
  config,
  { mode }
) => {
  return withEntitlementsPlist(config, (newConfig) => {
    newConfig.modResults["aps-environment"] = mode;
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
  return withEntitlementsPlist(config, (newConfig) => {
    if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
      newConfig.modResults[APP_GROUP_KEY] = [];
    }
    (newConfig.modResults[APP_GROUP_KEY] as Array<any>).push(
      `group.${newConfig?.ios?.bundleIdentifier || ""}.onesignal`
    );

    return newConfig;
  });
};

const withOneSignalNSE: ConfigPlugin<OneSignalPluginProps> = (config, {
  devTeam,
}) => {
  return withXcodeProject(config, async props => {
    xcodeProjectAddNse(
      props.modRequest.projectName || "",
      props.modRequest.platformProjectRoot,
      props.ios?.bundleIdentifier || "",
      devTeam,
      "node_modules/onesignal-expo-plugin/build/support/serviceExtensionFiles/"
    );

    return props;
  });
}

// ---------- ---------- ---------- ----------
export const withOneSignalIos: ConfigPlugin<OneSignalPluginProps> = (
  config,
  props
) => {
  withAppEnvironment(config, props);
  withRemoteNotificationsPermissions(config, props);
  withAppGroupPermissions(config, props);
  withOneSignalNSE(config, props);
  return config;
};


export function xcodeProjectAddNse(
  appName: string,
  iosPath: string,
  bundleIdentifier: string,
  devTeam: string,
  sourceDir: string
): void {
  const projPath = `${iosPath}/${appName}.xcodeproj/project.pbxproj`;
  const targetName = "OneSignalNotificationServiceExtension";

  const extFiles = [
    "NotificationService.h",
    "NotificationService.m",
    `${targetName}.entitlements`,
    `${targetName}-Info.plist`
  ];

  const xcodeProject = xcode.project(projPath);

  xcodeProject.parse(function(err: Error) {
    if (err) {
      console.log(`Error parsing iOS project: ${JSON.stringify(err)}`);
      return;
    }

    // Copy in the extension files
    fs.mkdirSync(`${iosPath}/${targetName}`, { recursive: true });
    extFiles.forEach(function (extFile) {
      let targetFile = `${iosPath}/${targetName}/${extFile}`;

      try {
        fs.createReadStream(`${sourceDir}${extFile}`).pipe(
          fs.createWriteStream(targetFile)
        );
      } catch (err) {
        console.log(err);
      }
    });

    const projObjects = xcodeProject.hash.project.objects;

    // Create new PBXGroup for the extension
    let extGroup = xcodeProject.addPbxGroup(extFiles, targetName, targetName);

    // Add the new PBXGroup to the top level group. This makes the
    // files / folder appear in the file explorer in Xcode.
    let groups = xcodeProject.hash.project.objects["PBXGroup"];
    Object.keys(groups).forEach(function (key) {
      if (groups[key].name === undefined) {
        xcodeProject.addToPbxGroup(extGroup.uuid, key);
      }
    });

    const mainTarget = xcodeProject.getFirstTarget();

    // WORK AROUND for codeProject.addTarget BUG
    // Xcode projects don't contain these if there is only one target
    // An upstream fix should be made to the code referenced in this link:
    //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
    projObjects['PBXTargetDependency'] = projObjects['PBXTargetDependency'] || {};
    projObjects['PBXContainerItemProxy'] = projObjects['PBXTargetDependency'] || {};

    // Add the NSE target
    // This adds PBXTargetDependency and PBXContainerItemProxy for you
    const nseTarget = xcodeProject.addTarget(targetName, "app_extension", targetName, `${bundleIdentifier}.${targetName}`);

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

    const pbxTargetDependencySection = xcodeProject.hash.project.objects["PBXTargetDependency"];
    const pbxContainerItemProxySection = xcodeProject.hash.project.objects["PBXContainerItemProxy"];

    console.log("HEEEEEEERE!!!!!!!!!!!");
    // console.log(JSON.stringify(xcodeProject));
    // console.log("-----------");
    console.log(JSON.stringify(pbxTargetDependencySection));
    console.log("-----------");
    console.log(JSON.stringify(pbxContainerItemProxySection));

    // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
    // However, can be more
    let configurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (let key in configurations) {
      if (
        typeof configurations[key].buildSettings !== "undefined" &&
        configurations[key].buildSettings.PRODUCT_NAME == `"${targetName}"`
      ) {
        let buildSettingsObj = configurations[key].buildSettings;
        buildSettingsObj.DEVELOPMENT_TEAM = devTeam;
        buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = IPHONEOS_DEPLOYMENT_TARGET;
        buildSettingsObj.TARGETED_DEVICE_FAMILY = TARGETED_DEVICE_FAMILY;
        buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${targetName}/${targetName}.entitlements`;
        buildSettingsObj.CODE_SIGN_STYLE = "Automatic";
      }
    }

    // Add development teams to both your target and the original project
    xcodeProject.addTargetAttribute("DevelopmentTeam", devTeam, nseTarget);
    xcodeProject.addTargetAttribute("DevelopmentTeam", devTeam);

    fs.writeFileSync(projPath, xcodeProject.writeSync());
  })
}
