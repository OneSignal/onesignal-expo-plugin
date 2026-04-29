import { ExpoConfig } from '@expo/config-types';

import { getAppGroupIdentifier } from '../helpers';
import { LIVE_ACTIVITY_TARGET_NAME, NSE_TARGET_NAME } from '../iosConstants';

type LiveActivityExtensionConfig = {
  targetName?: string;
  bundleIdentifierSuffix?: string;
};

export default function getEasManagedCredentialsConfigExtra(
  config: ExpoConfig,
  appGroupName?: string,
  nseBundleIdentifier?: string,
  liveActivities?: LiveActivityExtensionConfig,
): { [k: string]: any } {
  const bundleIdentifier = config?.ios?.bundleIdentifier ?? '';
  const bundleId = `${bundleIdentifier}.${nseBundleIdentifier ?? NSE_TARGET_NAME}`;
  const appExtensions = [
    ...(config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []),
    {
      targetName: NSE_TARGET_NAME,
      bundleIdentifier: bundleId,
      entitlements: {
        'com.apple.security.application-groups': [
          getAppGroupIdentifier(bundleIdentifier, appGroupName),
        ],
      },
    },
  ];

  if (liveActivities) {
    const targetName = liveActivities.targetName ?? LIVE_ACTIVITY_TARGET_NAME;
    const suffix = liveActivities.bundleIdentifierSuffix ?? targetName;
    appExtensions.push({
      targetName,
      bundleIdentifier: `${bundleIdentifier}.${suffix}`,
      entitlements: {},
    });
  }

  return {
    ...config.extra,
    eas: {
      ...config.extra?.eas,
      build: {
        ...config.extra?.eas?.build,
        experimental: {
          ...config.extra?.eas?.build?.experimental,
          ios: {
            ...config.extra?.eas?.build?.experimental?.ios,
            appExtensions,
          },
        },
      },
    },
  };
}
