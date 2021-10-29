export default {
  name: "RNOneSignalExpoExample",
  version: "1.0.0",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.sample.app",
  },
  android: {
    package: "com.sample.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    oneSignalAppId: 'ONE_SIGNAL_APP_ID',
  },
  plugins: [
    [
      "onesignal-expo-plugin",
      {
        mode: process.env.NODE_ENV || 'development',
      },
    ],
  ],
};
