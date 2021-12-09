/**
 * Expo config plugin for One Signal
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { ConfigPlugin } from '@expo/config-plugins';
import { withOneSignalAndroid } from './withOneSignalAndroid';
import { withOneSignalIos } from './withOneSignalIos';

export type OneSignalPluginProps = {
  /**
   * (iOS only) Environment name and bundle identifier
   */
  mode: string;
  iOsBundleIdentifier: string;
  devTeam: string;
};

const withOneSignal: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  config = withOneSignalIos(config, props);
  config = withOneSignalAndroid(config, props);

  return config;
};

export default withOneSignal;
