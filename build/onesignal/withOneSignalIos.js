"use strict";
/**
 * Expo config plugin for One Signal (iOS)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withOneSignalIos = void 0;
const config_plugins_1 = require("@expo/config-plugins");
// ---------- ---------- ---------- ----------
/**
 * Add 'app-environment' record with current environment to '<project-name>.entitlements' file
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withAppEnvironment = (config, { mode }) => {
    return (0, config_plugins_1.withEntitlementsPlist)(config, (newConfig) => {
        newConfig.modResults["aps-environment"] = mode;
        return newConfig;
    });
};
/**
 * Add "Background Modes -> Remote notifications" and "App Group" permissions
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withRemoteNotificationsPermissions = (config) => {
    const BACKGROUND_MODE_KEYS = ["external-accessory", "remote-notification"];
    return (0, config_plugins_1.withInfoPlist)(config, (newConfig) => {
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
const withAppGroupPermissions = (config) => {
    const APP_GROUP_KEY = "com.apple.security.application-groups";
    return (0, config_plugins_1.withEntitlementsPlist)(config, (newConfig) => {
        var _a;
        if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
            newConfig.modResults[APP_GROUP_KEY] = [];
        }
        newConfig.modResults[APP_GROUP_KEY].push(`group.${((_a = newConfig === null || newConfig === void 0 ? void 0 : newConfig.ios) === null || _a === void 0 ? void 0 : _a.bundleIdentifier) || ""}.onesignal`);
        return newConfig;
    });
};
// ---------- ---------- ---------- ----------
const withOneSignalIos = (config, props) => {
    withAppEnvironment(config, props);
    withRemoteNotificationsPermissions(config, props);
    withAppGroupPermissions(config, props);
    return config;
};
exports.withOneSignalIos = withOneSignalIos;
