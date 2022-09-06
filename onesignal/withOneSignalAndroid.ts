/**
 * Expo config plugin for One Signal (Android)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { ConfigPlugin } from '@expo/config-plugins';
import { OneSignalLog } from '../support/OneSignalLog';
import { OneSignalPluginProps } from '../types/types';

export const withOneSignalAndroid: ConfigPlugin<OneSignalPluginProps> = (
  config,
  props,
) => {
  //commented out until https://github.com/expo/eas-cli/issues/1226 is confirmed fixed
  //OneSignalLog.log("No specific actions required for OneSignal on Android...");
  return config;
};
