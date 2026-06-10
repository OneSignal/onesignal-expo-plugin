import type { ExpoConfig } from 'expo/config';
import { describe, expect, test, vi } from 'vite-plus/test';

vi.mock('expo/config-plugins', () => ({
  withDangerousMod: (config: ExpoConfig) => config,
  withStringsXml: (config: ExpoConfig) => config,
}));

function makeConfig(): ExpoConfig {
  return {
    name: 'TestApp',
    slug: 'test-app',
  };
}

describe('withOneSignalAndroid', () => {
  test('sets the disable location environment variable when configured', async () => {
    const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
    const previousValue = process.env.ONESIGNAL_DISABLE_LOCATION;

    try {
      withOneSignalAndroid(makeConfig(), {
        mode: 'production',
        disableLocation: true,
      });

      expect(process.env.ONESIGNAL_DISABLE_LOCATION).toBe('true');
    } finally {
      if (previousValue == null) {
        delete process.env.ONESIGNAL_DISABLE_LOCATION;
      } else {
        process.env.ONESIGNAL_DISABLE_LOCATION = previousValue;
      }
    }
  });
});
