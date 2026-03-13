export const IPHONEOS_DEPLOYMENT_TARGET = '11.0';
export const TARGETED_DEVICE_FAMILY = `"1,2"`;

export function getNsePodfileSnippet(targetName = NSE_TARGET_NAME): string {
  return `
target '${targetName}' do
  pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;
}

export function getNsePodfileRegex(targetName = NSE_TARGET_NAME): RegExp {
  return new RegExp(`target '${targetName}'`);
}

export const GROUP_IDENTIFIER_TEMPLATE_REGEX = /{{GROUP_IDENTIFIER}}/gm;
export const BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
export const BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;

export const DEFAULT_BUNDLE_VERSION = '1';
export const DEFAULT_BUNDLE_SHORT_VERSION = '1.0';

export const NSE_TARGET_NAME = 'OneSignalNotificationServiceExtension';

export function getAppGroupIdentifier(
  bundleIdentifier: string,
  customAppGroupName?: string,
): string {
  return customAppGroupName ?? `group.${bundleIdentifier}.onesignal`;
}
export const NSE_SOURCE_FILE = 'NotificationService.m';

export function getNseExtFiles(targetName = NSE_TARGET_NAME): string[] {
  return [
    'NotificationService.h',
    `${targetName}.entitlements`,
    `${targetName}-Info.plist`,
  ];
}
