export const IPHONEOS_DEPLOYMENT_TARGET = "11.0";
export const TARGETED_DEVICE_FAMILY = `"1,2"`;

export const NSE_PODFILE_SNIPPET = `
target 'OneSignalNotificationServiceExtension' do
  pod 'OneSignalXCFramework', '>= 3.0', '< 4.0'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;

export const NSE_PODFILE_REGEX = /target 'OneSignalNotificationServiceExtension'/;

export const GROUP_IDENTIFIER_TEMPLATE_REGEX = /{{GROUP_IDENTIFIER}}/gm;
export const BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
export const BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;

export const DEFAULT_BUNDLE_VERSION = '1';
export const DEFAULT_BUNDLE_SHORT_VERSION = '1.0';

export const NSE_TARGET_NAME = "OneSignalNotificationServiceExtension";
