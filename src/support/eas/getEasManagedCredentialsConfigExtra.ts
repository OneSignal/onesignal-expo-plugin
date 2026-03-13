import { NSE_TARGET_NAME } from '../iosConstants';
import { getAppGroupIdentifier } from '../helpers';
import { ExpoConfig } from '@expo/config-types';

export default function getEasManagedCredentialsConfigExtra(
  config: ExpoConfig,
  appGroupName?: string,
  nseBundleIdentifier?: string,
): { [k: string]: any } {
  const bundleId = `${config?.ios?.bundleIdentifier}.${
    nseBundleIdentifier ?? NSE_TARGET_NAME
  }`;
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
            appExtensions: [
              ...(config.extra?.eas?.build?.experimental?.ios?.appExtensions ??
                []),
              {
                targetName: NSE_TARGET_NAME,
                bundleIdentifier: bundleId,
                entitlements: {
                  'com.apple.security.application-groups': [
                    getAppGroupIdentifier(
                      config?.ios?.bundleIdentifier ?? '',
                      appGroupName,
                    ),
                  ],
                },
              },
            ],
          },
        },
      },
    },
  };
}
