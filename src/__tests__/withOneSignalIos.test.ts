import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from 'bun:test';
import type { ExpoConfig } from '@expo/config-types';
import type { OneSignalPluginProps } from '../types/types';
import { OneSignalLog } from '../support/OneSignalLog';

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

describe('resolveDevTeam', () => {
  let logSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    logSpy = spyOn(OneSignalLog, 'log');
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test('returns ios.appleTeamId when set', async () => {
    const { resolveDevTeam } = await import('../onesignal/withOneSignalIos');
    const config = makeConfig({
      ios: {
        bundleIdentifier: 'com.example.app',
        appleTeamId: 'TEAM_FROM_CONFIG',
      },
    });

    expect(resolveDevTeam(config, defaultProps)).toBe('TEAM_FROM_CONFIG');
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('prefers ios.appleTeamId over devTeam and warns devTeam is ignored', async () => {
    const { resolveDevTeam } = await import('../onesignal/withOneSignalIos');
    const config = makeConfig({
      ios: {
        bundleIdentifier: 'com.example.app',
        appleTeamId: 'TEAM_FROM_CONFIG',
      },
    });
    const props: OneSignalPluginProps = {
      ...defaultProps,
      devTeam: 'TEAM_FROM_PROPS',
    };

    expect(resolveDevTeam(config, props)).toBe('TEAM_FROM_CONFIG');
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('ignored');
  });

  test('falls back to devTeam and logs deprecation warning', async () => {
    const { resolveDevTeam } = await import('../onesignal/withOneSignalIos');
    const config = makeConfig();
    const props: OneSignalPluginProps = {
      ...defaultProps,
      devTeam: 'TEAM_FROM_PROPS',
    };

    expect(resolveDevTeam(config, props)).toBe('TEAM_FROM_PROPS');
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('deprecated');
  });

  test('returns undefined when neither is set', async () => {
    const { resolveDevTeam } = await import('../onesignal/withOneSignalIos');
    const config = makeConfig();

    expect(resolveDevTeam(config, defaultProps)).toBeUndefined();
    expect(logSpy).not.toHaveBeenCalled();
  });
});
