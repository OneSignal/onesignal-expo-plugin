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
    return config_plugins_1.withEntitlementsPlist(config, (newConfig) => {
        newConfig.modResults['aps-environment'] = mode;
        return newConfig;
    });
};
/**
 * Add "Background Modes -> Remote notifications" and "App Group" permissions
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withRemoteNotificationsPermissions = (config) => {
    return config_plugins_1.withInfoPlist(config, (newConfig) => {
        newConfig.modResults.UIBackgroundModes = [
            'external-accessory',
            'remote-notifications',
        ];
        return newConfig;
    });
};
/**
 * Add "App Group" permission
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps (step 4.4)
 */
const withAppGroupPermissions = (config) => {
    return config_plugins_1.withEntitlementsPlist(config, (newConfig) => {
        var _a;
        newConfig.modResults['com.apple.security.application-groups'] = [
            `group.${((_a = newConfig === null || newConfig === void 0 ? void 0 : newConfig.ios) === null || _a === void 0 ? void 0 : _a.bundleIdentifier) || ''}.onesignal`,
        ];
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
