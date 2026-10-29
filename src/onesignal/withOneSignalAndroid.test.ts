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
