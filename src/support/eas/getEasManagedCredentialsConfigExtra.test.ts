import type { ExpoConfig } from '@expo/config-types';
import { describe, expect, test } from 'vite-plus/test';

import getEasManagedCredentialsConfigExtra from './getEasManagedCredentialsConfigExtra';

function makeConfig(overrides: Partial<ExpoConfig> = {}): ExpoConfig {
  return {
    name: 'TestApp',
    slug: 'test-app',
    ios: { bundleIdentifier: 'com.example.app' },
    ...overrides,
  };
}

describe('getEasManagedCredentialsConfigExtra', () => {
  test('uses default app group when no custom name provided', () => {
    const result = getEasManagedCredentialsConfigExtra(makeConfig());
    const appExtension = result.eas.build.experimental.ios.appExtensions[0];

    expect(appExtension.entitlements['com.apple.security.application-groups']).toEqual([
      'group.com.example.app.onesignal',
    ]);
  });

  test('uses custom app group when provided', () => {
    const result = getEasManagedCredentialsConfigExtra(makeConfig(), 'group.com.example.custom');
    const appExtension = result.eas.build.experimental.ios.appExtensions[0];

    expect(appExtension.entitlements['com.apple.security.application-groups']).toEqual([
      'group.com.example.custom',
    ]);
  });

  test('preserves existing extra config', () => {
    const config = makeConfig({ extra: { existingKey: 'existingValue' } });
    const result = getEasManagedCredentialsConfigExtra(config);

    expect(result.existingKey).toBe('existingValue');
  });

  test('sets correct NSE target name and bundle identifier', () => {
    const result = getEasManagedCredentialsConfigExtra(makeConfig());
    const appExtension = result.eas.build.experimental.ios.appExtensions[0];

    expect(appExtension.targetName).toBe('OneSignalNotificationServiceExtension');
    expect(appExtension.bundleIdentifier).toBe(
      'com.example.app.OneSignalNotificationServiceExtension',
    );
  });

  test('uses custom NSE bundle identifier suffix when provided', () => {
    const result = getEasManagedCredentialsConfigExtra(makeConfig(), undefined, 'CustomNSE');
    const appExtension = result.eas.build.experimental.ios.appExtensions[0];

    expect(appExtension.targetName).toBe('OneSignalNotificationServiceExtension');
    expect(appExtension.bundleIdentifier).toBe('com.example.app.CustomNSE');
  });
});
