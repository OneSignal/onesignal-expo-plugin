import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { ExpoConfig } from '@expo/config-types';
import type { OneSignalPluginProps } from '../types/types';

const passthrough = (_config: ExpoConfig, _fn: unknown) => _config;

beforeEach(() => {
  mock.module('@expo/config-plugins', () => ({
    withEntitlementsPlist: passthrough,
    withInfoPlist: passthrough,
    withXcodeProject: passthrough,
    withDangerousMod: passthrough,
  }));
});

function makeConfig(overrides: Partial<ExpoConfig> = {}): ExpoConfig {
  return {
    name: 'TestApp',
    slug: 'test-app',
    ...overrides,
  };
}

const defaultProps: OneSignalPluginProps = {
  mode: 'production' as OneSignalPluginProps['mode'],
};

describe('withOneSignalIos', () => {
  test('does not throw when ios.bundleIdentifier is missing', async () => {
    const { withOneSignalIos } = await import('../onesignal/withOneSignalIos');
    const config = makeConfig();

    expect(() => withOneSignalIos(config, defaultProps)).not.toThrow();
  });

  test('does not set config.extra when ios.bundleIdentifier is missing', async () => {
    const { withOneSignalIos } = await import('../onesignal/withOneSignalIos');
    const config = makeConfig();

    const result = withOneSignalIos(config, defaultProps);
    expect(result.extra).toBeUndefined();
  });

  test('sets config.extra when ios.bundleIdentifier is present', async () => {
    const { withOneSignalIos } = await import('../onesignal/withOneSignalIos');
    const config = makeConfig({
      ios: { bundleIdentifier: 'com.example.app' },
    });

    const result = withOneSignalIos(config, defaultProps);
    expect(
      result.extra?.eas?.build?.experimental?.ios?.appExtensions,
    ).toBeDefined();
  });
});
