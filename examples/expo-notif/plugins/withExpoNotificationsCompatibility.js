const { withAppDelegate } = require('expo/config-plugins');

const IMPORT_ANCHOR = 'import Expo\n';
const IMPORTS = 'import Expo\nimport EXNotifications\nimport UserNotifications\n';
const LAUNCH_ANCHOR = `  ) -> Bool {
    let delegate = ReactNativeDelegate()`;
const LAUNCH_SETUP = `  ) -> Bool {
    // OneSignal can forward callbacks when Expo owns the notification center delegate first.
    UNUserNotificationCenter.current().delegate = NotificationCenterManager.shared

    let delegate = ReactNativeDelegate()`;

module.exports = function withExpoNotificationsCompatibility(config) {
  return withAppDelegate(config, (appDelegateConfig) => {
    if (appDelegateConfig.modResults.language !== 'swift') {
      throw new Error('expo-notifications compatibility requires a Swift AppDelegate');
    }

    let contents = appDelegateConfig.modResults.contents;

    if (!contents.includes('import EXNotifications')) {
      if (!contents.includes(IMPORT_ANCHOR)) {
        throw new Error('Could not find the Expo import in AppDelegate.swift');
      }
      contents = contents.replace(IMPORT_ANCHOR, IMPORTS);
    }

    if (!contents.includes('NotificationCenterManager.shared')) {
      if (!contents.includes(LAUNCH_ANCHOR)) {
        throw new Error('Could not find didFinishLaunchingWithOptions in AppDelegate.swift');
      }
      contents = contents.replace(LAUNCH_ANCHOR, LAUNCH_SETUP);
    }

    appDelegateConfig.modResults.contents = contents;
    return appDelegateConfig;
  });
};
