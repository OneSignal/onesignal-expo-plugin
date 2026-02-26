import { NSE_TARGET_NAME, getAppGroupIdentifier } from '../iosConstants';
import { ExpoConfig } from '@expo/config-types';

export default function getEasManagedCredentialsConfigExtra(
  config: ExpoConfig,
  appGroupName?: string,
): { [k: string]: any } {
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
                targetName: NSE_TARGET_NAME,
                bundleIdentifier: `${config?.ios?.bundleIdentifier}.${NSE_TARGET_NAME}`,
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
