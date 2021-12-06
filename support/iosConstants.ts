export const IPHONEOS_DEPLOYMENT_TARGET = "10.0";
export const TARGETED_DEVICE_FAMILY = `\"1,2\"`;

export const NSE_PODFILE_SNIPPET = `
target 'OneSignalNotificationServiceExtension' do
  pod 'OneSignalXCFramework', '>= 3.0', '< 4.0'
end`;

export const NSE_PODFILE_REGEX = /target 'OneSignalNotificationServiceExtension'/;

export const GROUP_IDENTIFIER_TEMPLATE_REGEX = /{{GROUP_IDENTIFIER}}/gm;
