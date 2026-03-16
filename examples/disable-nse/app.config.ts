import { ConfigContext, ExpoConfig } from '@expo/config';

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
      },
    ],
  ],
  extra: {
    oneSignalAppId: 'b79087eb-8531-4d2d-a6f5-726f797891c7',
  },
});
