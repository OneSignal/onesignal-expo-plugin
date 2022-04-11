/**
 * Expo config plugin for One Signal
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { ConfigPlugin } from '@expo/config-plugins';
import { OneSignalPluginProps } from '../types/types';
import { withOneSignalAndroid } from './withOneSignalAndroid';
import { withOneSignalIos } from './withOneSignalIos';

const withOneSignal: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  config = withOneSignalIos(config, props);
  config = withOneSignalAndroid(config, props);

  return config;
};

export default withOneSignal;
