import type { ExpoConfig } from '@expo/config-types';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { OneSignalLog } from '../support/OneSignalLog';
import type { OneSignalPluginProps } from '../types/types';

vi.mock('@expo/config-plugins', () => {
  const passthrough = (_config: unknown, _fn: unknown) => _config;
  return {
    withEntitlementsPlist: passthrough,
    withInfoPlist: passthrough,
    withXcodeProject: passthrough,
    withDangerousMod: passthrough,
    IOSConfig: {
      Paths: { getSourceRoot: () => '' },
      XcodeUtils: {
        addResourceFileToGroup: ({ project }: { project: unknown }) => project,
      },
    },
  };
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
    const { withOneSignalIos } = await import('./withOneSignalIos');
    const config = makeConfig();

    expect(() => withOneSignalIos(config, defaultProps)).not.toThrow();
  });

  test('does not set config.extra when ios.bundleIdentifier is missing', async () => {
    const { withOneSignalIos } = await import('./withOneSignalIos');
    const config = makeConfig();

    const result = withOneSignalIos(config, defaultProps);
    expect(result.extra).toBeUndefined();
  });

  test('sets config.extra when ios.bundleIdentifier is present', async () => {
    const { withOneSignalIos } = await import('./withOneSignalIos');
    const config = makeConfig({
      ios: { bundleIdentifier: 'com.example.app' },
    });

    const result = withOneSignalIos(config, defaultProps);
    expect(result.extra?.eas?.build?.experimental?.ios?.appExtensions).toBeDefined();
  });

  test('does not add Live Activity extension when liveActivities is missing', async () => {
    const { withOneSignalIos } = await import('./withOneSignalIos');
    const config = makeConfig({
      ios: { bundleIdentifier: 'com.example.app' },
    });

    const result = withOneSignalIos(config, defaultProps);
    const appExtensions = result.extra?.eas?.build?.experimental?.ios?.appExtensions;
    expect(appExtensions).toHaveLength(1);
    expect(appExtensions?.[0].targetName).toBe('OneSignalNotificationServiceExtension');
  });

  test('adds default Live Activity extension when liveActivities is set', async () => {
    const { withOneSignalIos } = await import('./withOneSignalIos');
    const config = makeConfig({
      ios: { bundleIdentifier: 'com.example.app' },
    });
    const props: OneSignalPluginProps = {
      ...defaultProps,
      liveActivities: {},
    };

    const result = withOneSignalIos(config, props);
    const appExtensions = result.extra?.eas?.build?.experimental?.ios?.appExtensions;
    expect(appExtensions?.[1]).toEqual({
      targetName: 'OneSignalWidget',
      bundleIdentifier: 'com.example.app.OneSignalWidget',
      entitlements: {},
    });
  });

  test('adds custom Live Activity extension when target and suffix are set', async () => {
    const { withOneSignalIos } = await import('./withOneSignalIos');
    const config = makeConfig({
      ios: { bundleIdentifier: 'com.example.app' },
    });
    const props: OneSignalPluginProps = {
      ...defaultProps,
      liveActivities: {
        targetName: 'MyWidget',
        bundleIdentifierSuffix: 'widget',
      },
    };

    const result = withOneSignalIos(config, props);
    const appExtensions = result.extra?.eas?.build?.experimental?.ios?.appExtensions;
    expect(appExtensions?.[1]).toEqual({
      targetName: 'MyWidget',
      bundleIdentifier: 'com.example.app.widget',
      entitlements: {},
    });
  });
});

describe('resolveDevTeam', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(OneSignalLog, 'log');
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test('returns ios.appleTeamId when set', async () => {
    const { resolveDevTeam } = await import('./withOneSignalIos');
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
    const { resolveDevTeam } = await import('./withOneSignalIos');
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
    const { resolveDevTeam } = await import('./withOneSignalIos');
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
    const { resolveDevTeam } = await import('./withOneSignalIos');
    const config = makeConfig();

    expect(resolveDevTeam(config, defaultProps)).toBeUndefined();
    expect(logSpy).not.toHaveBeenCalled();
  });
});
