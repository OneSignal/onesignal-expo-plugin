import type { ExpoConfig } from 'expo/config';
import { describe, expect, test, vi } from 'vite-plus/test';

vi.mock('expo/config-plugins', () => ({
  withDangerousMod: (config: ExpoConfig) => config,
  withGradleProperties: (
    config: ExpoConfig,
    action: (config: ExpoConfig & { modResults: any[] }) => ExpoConfig,
  ) =>
    action({
      ...config,
      modResults: [],
    }),
  withStringsXml: (config: ExpoConfig) => config,
}));

function makeConfig(): ExpoConfig {
  return {
    name: 'TestApp',
    slug: 'test-app',
  };
}

describe('withOneSignalAndroid', () => {
  test('sets the disable location Gradle property when configured', async () => {
    const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
    const config = withOneSignalAndroid(makeConfig(), {
      mode: 'production',
      disableLocation: true,
    }) as ExpoConfig & { modResults: Array<{ type: string; key: string; value: string }> };

    expect(config.modResults).toContainEqual({
      type: 'property',
      key: 'onesignal.disableLocation',
      value: 'true',
    });
  });
});
