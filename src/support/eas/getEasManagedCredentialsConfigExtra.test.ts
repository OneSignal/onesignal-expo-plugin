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

  test('does not include Live Activity extension when not provided', () => {
    const result = getEasManagedCredentialsConfigExtra(makeConfig());
    const appExtensions = result.eas.build.experimental.ios.appExtensions;

    expect(appExtensions).toHaveLength(1);
    expect(appExtensions[0].targetName).toBe('OneSignalNotificationServiceExtension');
  });

  test('adds default Live Activity extension when provided', () => {
    const result = getEasManagedCredentialsConfigExtra(makeConfig(), undefined, undefined, {});
    const appExtensions = result.eas.build.experimental.ios.appExtensions;

    expect(appExtensions).toHaveLength(2);
    expect(appExtensions[1]).toEqual({
      targetName: 'OneSignalWidget',
      bundleIdentifier: 'com.example.app.OneSignalWidget',
      entitlements: {},
    });
  });

  test('adds custom Live Activity extension when target and suffix are provided', () => {
    const result = getEasManagedCredentialsConfigExtra(makeConfig(), undefined, undefined, {
      targetName: 'MyWidget',
      bundleIdentifierSuffix: 'widget',
    });
    const appExtensions = result.eas.build.experimental.ios.appExtensions;

    expect(appExtensions[1]).toEqual({
      targetName: 'MyWidget',
      bundleIdentifier: 'com.example.app.widget',
      entitlements: {},
    });
  });
});
