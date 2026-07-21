import { ConfigContext, ExpoConfig } from '@expo/config';
import withOneSignal from 'onesignal-expo-plugin/plugin';

const withExpoNotificationsDelegate = require('./plugins/withExpoNotificationsDelegate');

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig: ExpoConfig = {
    ...config,
    name: 'OneSignal Expo Notifications',
    slug: 'expo-notif',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'expo-notif',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      appleTeamId: '99SW8E36CT',
      bundleIdentifier: 'com.onesignal.example',
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
      entitlements: {
        'aps-environment': 'development',
      },
      supportsTablet: true,
    },
    android: {
      package: 'com.onesignal.example',
    },
    plugins: [
      'expo-notifications',
      withOneSignal({
        mode: 'development',
      }),
    ],
  };

  return withExpoNotificationsDelegate(expoConfig);
};
