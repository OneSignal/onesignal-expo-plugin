/**
 * Configuration for the iOS Widget Extension target that hosts Live Activities.
 */
export type OneSignalLiveActivityProps = {
  /**
   * (optional) Custom widget extension target name. Defaults to "OneSignalWidget".
   * The full bundle identifier becomes "{ios.bundleIdentifier}.{bundleIdentifierSuffix ?? targetName}".
   */
  targetName?: string;

  /**
   * (optional) Suffix appended to ios.bundleIdentifier for the widget extension. Defaults to targetName.
   */
  bundleIdentifierSuffix?: string;

  /**
   * (optional) Local path to a custom Live Activity widget Swift file. If omitted, ships a default
   * widget built on `DefaultLiveActivityAttributes` so it works with `OneSignal.LiveActivities.setupDefault()`.
   */
  widgetFilePath?: string;
};

/**
 * OneSignalPluginProps refer to the properties set by the user in their app config file (e.g: app.json)
 */
export type OneSignalPluginProps = {
  /**
   * (required) Used to configure APNs environment entitlement. "development" or "production"
   */
  mode: 'development' | 'production';

  /**
   * (optional) Used to configure Apple Team ID. You can find your Apple Team ID by running expo credentials:manager e.g: "91SW8A37CR"
   * @deprecated Use `ios.appleTeamId` in your Expo config instead. This prop will be removed in a future major release.
   */
  devTeam?: string;

  /**
   * (optional) Target IPHONEOS_DEPLOYMENT_TARGET value to be used when adding the iOS NSE. A deployment target is nothing more than
   * the minimum version of the operating system the application can run on. This value should match the value in your Podfile e.g: "12.0".
   */
  iPhoneDeploymentTarget?: string;

  /**
   * (optional) The small notification icons for Android.  Images will be automatically scaled up/down, the recommended size
   * is 96x96 to always scale down.
   */
  smallIcons?: string[];

  /**
   * (optional) The accent color to use for notification icons on Android. Must be a valid Android color resource, for example: "#FF0000"
   */
  smallIconAccentColor?: string;

  /**
   * (optional) The large notification icons for Android. Images will be automatically scaled up/down to 256x256.
   */
  largeIcons?: string[];

  /**
   * (optional) The local path to a custom Notification Service Extension (NSE), written in Swift. The NSE will typically start as a copy
   * of the default NSE found at (serviceExtensionFiles/NotificationService.swift), then altered to support any custom
   * logic required.
   */
  iosNSEFilePath?: string;

  /**
   * (optional) Used to configure a custom iOS app group name. If not provided, defaults to "group.{ios.bundleIdentifier}.onesignal".
   * @see https://documentation.onesignal.com/docs/ios-sdk-setup#step-3-create-an-app-group
   */
  appGroupName?: string;

  /**
   * (optional) Used to configure a custom bundle identifier suffix for the iOS Notification Service Extension.
   * The full bundle identifier will be "{ios.bundleIdentifier}.{nseBundleIdentifier}".
   * If not provided, defaults to "OneSignalNotificationServiceExtension".
   */
  nseBundleIdentifier?: string;

  /**
   * (optional) If true, the iOS Notification Service Extension (NSE) will not be added to the project.
   * The NSE is required for badges, confirmed delivery, media attachments, and action buttons.
   * Only disable if you only need basic push notifications.
   */
  disableNSE?: boolean;

  /**
   * (optional) An array of local paths to custom notification sound files (.wav only).
   * Files are added to the iOS app bundle and Android res/raw/.
   * @see https://documentation.onesignal.com/docs/customize-notification-sounds
   */
  sounds?: string[];

  /**
   * (optional) Opt in to scaffolding an iOS Widget Extension target for Live Activities.
   * Presence of this prop enables Live Activity setup. Requires iOS 16.1+ and a .p8 APNs key.
   * @see https://documentation.onesignal.com/docs/cross-platform-live-activity-setup
   */
  liveActivities?: OneSignalLiveActivityProps;
};

export const ONESIGNAL_PLUGIN_PROPS: string[] = [
  'mode',
  'devTeam',
  'iPhoneDeploymentTarget',
  'smallIcons',
  'largeIcons',
  'iosNSEFilePath',
  'smallIconAccentColor',
  'appGroupName',
  'nseBundleIdentifier',
  'disableNSE',
  'sounds',
  'liveActivities',
];
