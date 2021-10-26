"use strict";
/**
 * Expo config plugin for One Signal (Android)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withOneSignalAndroid = void 0;
const config_plugins_1 = require("@expo/config-plugins");
// ---------- ---------- ---------- ----------
const oneSignalGradle = `
buildscript {
    repositories {
        gradlePluginPortal()
    }
    dependencies {
        classpath 'gradle.plugin.com.onesignal:onesignal-gradle-plugin:[0.12.10, 0.99.99]'
    }
}

apply plugin: 'com.onesignal.androidsdk.onesignal-gradle-plugin'`;
// ---------- ---------- ---------- ----------
const withGradleBuildConfig = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, (newConfig) => {
        newConfig.modResults.contents = `${oneSignalGradle.trimStart()}\n\n${newConfig.modResults.contents}`;
        return newConfig;
    });
};
// ---------- ---------- ---------- ----------
const withOneSignalAndroid = (config, props) => {
    withGradleBuildConfig(config, props);
    return config;
};
exports.withOneSignalAndroid = withOneSignalAndroid;
