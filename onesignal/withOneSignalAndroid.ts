/**
 * Expo config plugin for One Signal (Android)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins';
import { ONESIGNAL_GRADLE } from '../support/androidConstants';
import { OneSignalPluginProps } from './withOneSignal';

const withGradleBuildConfig: ConfigPlugin<OneSignalPluginProps> = (config) => {
  return withAppBuildGradle(config, (newConfig) => {
    newConfig.modResults.contents = `${oneSignalGradle.trimStart()}\n\n${
      newConfig.modResults.contents
    }`;
    return newConfig;
  });
};

// ---------- ---------- ---------- ----------
export const withOneSignalAndroid: ConfigPlugin<OneSignalPluginProps> = (
  config,
  props,
) => {
  withGradleBuildConfig(config, props);

  return config;
};
