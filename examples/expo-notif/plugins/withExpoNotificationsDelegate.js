const { withAppDelegate } = require('@expo/config-plugins');

const expoImport = 'import Expo\n';
const notificationImports = 'import EXNotifications\nimport UserNotifications\n';
const launchFunctionStart = `  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
`;
const delegateAssignment = `    // OneSignal can forward callbacks when Expo owns the notification center delegate first.
    UNUserNotificationCenter.current().delegate = NotificationCenterManager.shared

`;

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withExpoNotificationsDelegate = (config) =>
  withAppDelegate(config, (appDelegateConfig) => {
    if (appDelegateConfig.modResults.language !== 'swift') {
      throw new Error('The expo-notif delegate workaround requires a Swift AppDelegate.');
    }

    let contents = appDelegateConfig.modResults.contents;

    if (!contents.includes(notificationImports)) {
      if (!contents.includes(expoImport)) {
        throw new Error('Unable to find the Expo import in AppDelegate.swift.');
      }

      contents = contents.replace(expoImport, `${expoImport}${notificationImports}`);
    }

    if (!contents.includes(delegateAssignment)) {
      if (!contents.includes(launchFunctionStart)) {
        throw new Error('Unable to find didFinishLaunchingWithOptions in AppDelegate.swift.');
      }

      contents = contents.replace(
        launchFunctionStart,
        `${launchFunctionStart}${delegateAssignment}`,
      );
    }

    appDelegateConfig.modResults.contents = contents;
    return appDelegateConfig;
  });

module.exports = withExpoNotificationsDelegate;
