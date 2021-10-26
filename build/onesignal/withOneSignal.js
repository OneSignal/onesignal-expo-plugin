"use strict";
/**
 * Expo config plugin for One Signal
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
Object.defineProperty(exports, "__esModule", { value: true });
const withOneSignalAndroid_1 = require("./withOneSignalAndroid");
const withOneSignalIos_1 = require("./withOneSignalIos");
const withOneSignal = (config, props) => {
    config = (0, withOneSignalIos_1.withOneSignalIos)(config, props);
    config = (0, withOneSignalAndroid_1.withOneSignalAndroid)(config, props);
    return config;
};
exports.default = withOneSignal;
