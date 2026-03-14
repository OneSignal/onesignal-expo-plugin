import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'OneSignal Demo',
  slug: 'demo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'demo',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    icon: './assets/images/icon.png',
    bundleIdentifier: 'com.onesignal.example',
    appleTeamId: '99SW8E36CT', // For setting the main target's development team
    infoPlist: {
      // For push notifications support when app is not in foreground
      UIBackgroundModes: ['remote-notification'],

      // For OneSignal location permissions
      NSLocationWhenInUseUsageDescription: 'This app uses your location to...',
    },
    entitlements: {
      'aps-environment': 'development', // For push notifications support
      'com.apple.security.application-groups': ['group.expoNotUsed'], // Additional app groups if needed (you can have multiple app groups)
    },
    supportsTablet: true,
  },
  android: {
    package: 'com.onesignal.example',
    // For OneSignal location permissions
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
  },
  plugins: [
    [
      'onesignal-expo-plugin',
      {
        mode: 'development',
        devTeam: '99SW8E36CT', // Optional: For setting the Notification Service Extension's development team
        appGroupName: 'group.expoCustom', // Optional: If you had your own app group name, you can set it here
        nseBundleIdentifier: 'ExpoNSE', // Optional: Custom bundle identifier for the Notification Service Extension
        smallIcons: ['./assets/images/small_icon.png'],
        smallIconAccentColor: '#C0FFEE',
      },
    ],
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    oneSignalAppId: '77e32082-ea27-42e3-a898-c72e141824ef',
  },
});
