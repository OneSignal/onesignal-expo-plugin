import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import type { ExpoConfig } from 'expo/config';
import type { AndroidConfig } from 'expo/config-plugins';
import { describe, expect, test, vi } from 'vite-plus/test';

type AndroidManifest = AndroidConfig.Manifest.AndroidManifest;
type ManifestMetaData = AndroidConfig.Manifest.ManifestMetaData;

const withAndroidManifestMock = vi.fn(
  (
    config: ExpoConfig,
    action: (config: ExpoConfig & { modResults: AndroidManifest }) => ExpoConfig,
  ) => action({ ...config, modResults: makeManifest() }),
);

const addWarningAndroidMock = vi.fn();

vi.mock('expo/config-plugins', async (importOriginal) => {
  const actual = await importOriginal<typeof import('expo/config-plugins')>();
  return {
    AndroidConfig: actual.AndroidConfig,
    WarningAggregator: { addWarningAndroid: addWarningAndroidMock },
    withAndroidManifest: withAndroidManifestMock,
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
  };
});

function makeConfig(): ExpoConfig {
  return {
    name: 'TestApp',
    slug: 'test-app',
  };
}

function makeManifest(): AndroidManifest {
  return {
    manifest: {
      $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
      queries: [],
      application: [{ $: { 'android:name': '.MainApplication' } }],
    },
  };
}

function makeProjectWithReactNativeOneSignal(version?: string): string {
  const projectRoot = mkdtempSync(join(tmpdir(), 'onesignal-expo-plugin-'));
  writeFileSync(join(projectRoot, 'package.json'), '{}');
  if (version) {
    const packageDir = join(projectRoot, 'node_modules', 'react-native-onesignal');
    mkdirSync(packageDir, { recursive: true });
    writeFileSync(
      join(packageDir, 'package.json'),
      JSON.stringify({ name: 'react-native-onesignal', version }),
    );
  }
  return projectRoot;
}

function mockManifestModInProject(projectRoot: string) {
  withAndroidManifestMock.mockImplementationOnce((config, action) =>
    action({
      ...config,
      modRequest: { projectRoot },
      modResults: makeManifest(),
    } as ExpoConfig & { modResults: AndroidManifest }),
  );
}

function getMetaData(config: ExpoConfig): ManifestMetaData[] {
  const manifest = (config as ExpoConfig & { modResults: AndroidManifest }).modResults;
  return manifest.manifest.application?.[0]['meta-data'] ?? [];
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

  describe('enableFirebaseInstallationId', () => {
    test('adds the FID meta-data to the main application when true', async () => {
      const { withOneSignalAndroid, FIREBASE_INSTALLATION_ID_META_DATA } =
        await import('./withOneSignalAndroid');
      withAndroidManifestMock.mockClear();

      const config = withOneSignalAndroid(makeConfig(), {
        mode: 'production',
        enableFirebaseInstallationId: true,
      });

      expect(withAndroidManifestMock).toHaveBeenCalledTimes(1);
      expect(getMetaData(config)).toContainEqual({
        $: {
          'android:name': FIREBASE_INSTALLATION_ID_META_DATA,
          'android:value': 'true',
        },
      });
    });

    test('warns when true without android.googleServicesFile', async () => {
      const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
      addWarningAndroidMock.mockClear();

      withOneSignalAndroid(makeConfig(), {
        mode: 'production',
        enableFirebaseInstallationId: true,
      });

      expect(addWarningAndroidMock).toHaveBeenCalledTimes(1);
      expect(addWarningAndroidMock.mock.calls[0][1]).toContain('android.googleServicesFile');
    });

    test('does not warn when android.googleServicesFile is set', async () => {
      const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
      addWarningAndroidMock.mockClear();

      withOneSignalAndroid(
        { ...makeConfig(), android: { googleServicesFile: './google-services.json' } },
        { mode: 'production', enableFirebaseInstallationId: true },
      );

      expect(addWarningAndroidMock).not.toHaveBeenCalled();
    });

    test('replaces an existing FID meta-data entry instead of duplicating it', async () => {
      const { withOneSignalAndroid, FIREBASE_INSTALLATION_ID_META_DATA } =
        await import('./withOneSignalAndroid');
      withAndroidManifestMock.mockImplementationOnce((config, action) => {
        const manifest = makeManifest();
        manifest.manifest.application![0]['meta-data'] = [
          {
            $: { 'android:name': FIREBASE_INSTALLATION_ID_META_DATA, 'android:value': 'false' },
          },
        ];
        return action({ ...config, modResults: manifest });
      });

      const config = withOneSignalAndroid(makeConfig(), {
        mode: 'production',
        enableFirebaseInstallationId: true,
      });

      const fidEntries = getMetaData(config).filter(
        (item) => item.$['android:name'] === FIREBASE_INSTALLATION_ID_META_DATA,
      );
      expect(fidEntries).toEqual([
        {
          $: { 'android:name': FIREBASE_INSTALLATION_ID_META_DATA, 'android:value': 'true' },
        },
      ]);
    });

    test('does not touch the manifest when unset', async () => {
      const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
      withAndroidManifestMock.mockClear();

      withOneSignalAndroid(makeConfig(), { mode: 'production' });

      expect(withAndroidManifestMock).not.toHaveBeenCalled();
    });

    test('removes an existing FID meta-data entry when false', async () => {
      const { withOneSignalAndroid, FIREBASE_INSTALLATION_ID_META_DATA } =
        await import('./withOneSignalAndroid');
      withAndroidManifestMock.mockImplementationOnce((config, action) => {
        const manifest = makeManifest();
        manifest.manifest.application![0]['meta-data'] = [
          { $: { 'android:name': FIREBASE_INSTALLATION_ID_META_DATA, 'android:value': 'true' } },
          { $: { 'android:name': 'other_meta_data', 'android:value': 'kept' } },
        ];
        return action({ ...config, modResults: manifest });
      });

      const config = withOneSignalAndroid(makeConfig(), {
        mode: 'production',
        enableFirebaseInstallationId: false,
      });

      expect(getMetaData(config)).toEqual([
        { $: { 'android:name': 'other_meta_data', 'android:value': 'kept' } },
      ]);
    });

    test.each(['5.5.16', '5.5.17', '5.6.0', '6.0.0'])(
      'allows react-native-onesignal %s when true',
      async (version) => {
        const { withOneSignalAndroid, FIREBASE_INSTALLATION_ID_META_DATA } =
          await import('./withOneSignalAndroid');
        mockManifestModInProject(makeProjectWithReactNativeOneSignal(version));

        const config = withOneSignalAndroid(makeConfig(), {
          mode: 'production',
          enableFirebaseInstallationId: true,
        });

        expect(getMetaData(config)).toContainEqual({
          $: { 'android:name': FIREBASE_INSTALLATION_ID_META_DATA, 'android:value': 'true' },
        });
      },
    );

    test.each(['5.0.0', '5.5.15'])(
      'fails when true with react-native-onesignal %s',
      async (version) => {
        const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
        mockManifestModInProject(makeProjectWithReactNativeOneSignal(version));

        expect(() =>
          withOneSignalAndroid(makeConfig(), {
            mode: 'production',
            enableFirebaseInstallationId: true,
          }),
        ).toThrow(`requires react-native-onesignal 5.5.16 or newer, but ${version} is installed`);
      },
    );

    test('does not fail when false with an older react-native-onesignal', async () => {
      const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
      mockManifestModInProject(makeProjectWithReactNativeOneSignal('5.5.15'));

      expect(() =>
        withOneSignalAndroid(makeConfig(), {
          mode: 'production',
          enableFirebaseInstallationId: false,
        }),
      ).not.toThrow();
    });

    test('does not fail when react-native-onesignal cannot be resolved', async () => {
      const { withOneSignalAndroid } = await import('./withOneSignalAndroid');
      mockManifestModInProject(makeProjectWithReactNativeOneSignal());

      expect(() =>
        withOneSignalAndroid(makeConfig(), {
          mode: 'production',
          enableFirebaseInstallationId: true,
        }),
      ).not.toThrow();
    });

    test('does not write a false value when false', async () => {
      const { withOneSignalAndroid } = await import('./withOneSignalAndroid');

      const config = withOneSignalAndroid(makeConfig(), {
        mode: 'production',
        enableFirebaseInstallationId: false,
      });

      expect(getMetaData(config)).toEqual([]);
    });
  });
});
