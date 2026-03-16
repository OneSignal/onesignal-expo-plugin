import { ConfigContext, ExpoConfig } from '@expo/config';
import type { OneSignalPluginProps } from 'onesignal-expo-plugin';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DisableNSE Example',
  slug: 'disable-nse',
  version: '1.0.0',
  orientation: 'portrait',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.onesignal.example',
  },
  android: {
    package: 'com.onesignal.example',
  },
  plugins: [
    [
      'onesignal-expo-plugin',
      {
        mode: 'development',
        disableNSE: true,
      } satisfies OneSignalPluginProps,
    ],
  ],
  extra: {
    oneSignalAppId: '77e32082-ea27-42e3-a898-c72e141824ef',
  },
});
