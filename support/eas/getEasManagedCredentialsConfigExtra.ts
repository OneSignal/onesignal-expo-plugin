import { ExpoConfig } from '@expo/config-types';
import { OneSignalPluginProps } from "../../types/types";
import { NSE_TARGET_NAME } from "../iosConstants";

export default function getEasManagedCredentialsConfigExtra(config: ExpoConfig, props?: OneSignalPluginProps): {[k: string]: any} {
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
              ...(config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []),
              {
                // keep in sync with native changes in NSE
                targetName: NSE_TARGET_NAME,
                bundleIdentifier: `${config?.ios?.bundleIdentifier}.${NSE_TARGET_NAME}`,
                entitlements: {
                  'com.apple.security.application-groups': [
                    `group.${props?.appGroupName || config?.ios?.bundleIdentifier}.onesignal`
                  ]
                },
              }
            ]
          }
        }
      }
    }
  }
}
