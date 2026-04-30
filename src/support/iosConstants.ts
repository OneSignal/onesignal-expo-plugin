export const IPHONEOS_DEPLOYMENT_TARGET = '11.0';
export const TARGETED_DEVICE_FAMILY = `"1,2"`;

export const GROUP_IDENTIFIER_TEMPLATE_REGEX = /{{GROUP_IDENTIFIER}}/gm;
export const BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
export const BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;
export const NSE_PRINCIPAL_CLASS_TEMPLATE_REGEX = /{{NSE_PRINCIPAL_CLASS}}/gm;

export const DEFAULT_BUNDLE_VERSION = '1';
export const DEFAULT_BUNDLE_SHORT_VERSION = '1.0';

export const NSE_TARGET_NAME = 'OneSignalNotificationServiceExtension';
/** Default Swift template shipped under serviceExtensionFiles/. */
export const NSE_SOURCE_FILE = 'NotificationService.swift';

export const NSE_PODFILE_SNIPPET = `
target '${NSE_TARGET_NAME}' do
  pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;

export const NSE_PODFILE_REGEX = new RegExp(`target '${NSE_TARGET_NAME}'`);

export const NSE_EXT_FILES = [`${NSE_TARGET_NAME}.entitlements`, `${NSE_TARGET_NAME}-Info.plist`];

export const LIVE_ACTIVITY_TARGET_NAME = 'OneSignalWidget';
export const LIVE_ACTIVITY_DEPLOYMENT_TARGET = '16.2';
export const LIVE_ACTIVITY_BUNDLE_FILE = 'OneSignalWidgetBundle.swift';
export const LIVE_ACTIVITY_WIDGET_FILE = 'OneSignalWidgetLiveActivity.swift';
export const LIVE_ACTIVITY_INFO_PLIST_FILE = `${LIVE_ACTIVITY_TARGET_NAME}-Info.plist`;

export const liveActivityPodfileSnippet = (targetName: string): string => `
target '${targetName}' do
  pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;

export const liveActivityPodfileRegex = (targetName: string): RegExp =>
  new RegExp(`target '${targetName}'`);
