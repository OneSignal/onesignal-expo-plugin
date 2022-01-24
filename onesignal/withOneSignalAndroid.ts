/**
 * Expo config plugin for One Signal (Android)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins';
import { ONESIGNAL_GRADLE } from '../support/androidConstants';
import { OneSignalPluginProps } from './withOneSignal';

const withGradleBuildConfig: ConfigPlugin<OneSignalPluginProps> = (config) => {
  return withAppBuildGradle(config, (newConfig) => {
    let { contents } = newConfig.modResults;

    // make sure we haven't previously added dependencies
    if (!contents.includes(ONESIGNAL_GRADLE)) {
      contents = `${ONESIGNAL_GRADLE}\n${contents}`;
    } else {
      console.log("OneSignal dependencies already added to build.gradle. Skipping...");
    }

    newConfig.modResults.contents = contents;
    return newConfig;
  });
};

export const withOneSignalAndroid: ConfigPlugin<OneSignalPluginProps> = (
  config,
  props,
) => {
  withGradleBuildConfig(config, props);

  return config;
};
