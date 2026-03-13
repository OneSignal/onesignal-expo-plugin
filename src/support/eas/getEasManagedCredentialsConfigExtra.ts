import { DEFAULT_NSE_TARGET_NAME } from '../iosConstants';
import { getAppGroupIdentifier } from '../helpers';
import { ExpoConfig } from '@expo/config-types';

export default function getEasManagedCredentialsConfigExtra(
  config: ExpoConfig,
  appGroupName?: string,
  nseTargetName?: string,
): { [k: string]: any } {
  const targetName = nseTargetName ?? DEFAULT_NSE_TARGET_NAME;
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
                // keep in sync with native changes in NSE
                targetName,
                bundleIdentifier: `${config?.ios?.bundleIdentifier}.${targetName}`,
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
