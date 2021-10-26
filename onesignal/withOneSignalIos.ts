/**
 * Expo config plugin for One Signal (iOS)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
} from "@expo/config-plugins";
import { OneSignalPluginProps } from "./withOneSignal";

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
  const BACKGROUND_MODE_KEYS = ["external-accessory", "remote-notification"];
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

// ---------- ---------- ---------- ----------
export const withOneSignalIos: ConfigPlugin<OneSignalPluginProps> = (
  config,
  props
) => {
  withAppEnvironment(config, props);
  withRemoteNotificationsPermissions(config, props);
  withAppGroupPermissions(config, props);

  return config;
};
