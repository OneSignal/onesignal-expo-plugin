import { ConfigContext, ExpoConfig } from '@expo/config';
import withOneSignal from 'onesignal-expo-plugin/plugin';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'OneSignal No-Location Demo',
  slug: 'demo-no-location',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'demo-no-location',
  userInterfaceStyle: 'automatic',
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
    withOneSignal({
      mode: 'development',
      disableLocation: true,
    }),
  ],
});
