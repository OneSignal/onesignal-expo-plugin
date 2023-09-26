/**
 * Expo config plugin for One Signal
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { ConfigPlugin } from '@expo/config-plugins';
import { OneSignalPluginProps } from '../types/types';
import { withOneSignalAndroid } from './withOneSignalAndroid';
import { withOneSignalIos } from './withOneSignalIos';
import { validatePluginProps } from '../support/helpers';

const withOneSignal: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  // if props are undefined, throw error
  if (!props) {
    throw new Error(
      'You are trying to use the OneSignal plugin without any props. Property "mode" is required. Please see https://github.com/OneSignal/onesignal-expo-plugin for more info.'
    );
  }

  validatePluginProps(props);

  config = withOneSignalIos(config, props);
  config = withOneSignalAndroid(config, props);

  return config;
};

export default withOneSignal;
