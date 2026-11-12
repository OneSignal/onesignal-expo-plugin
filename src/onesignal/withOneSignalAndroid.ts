/**
 * Expo config plugin for OneSignal (Android)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import { existsSync, mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve, parse, basename } from 'path';

import { generateImageAsync } from '@expo/image-utils';
import type { ExpoConfig } from 'expo/config';
import {
  AndroidConfig,
  ConfigPlugin,
  WarningAggregator,
  withAndroidManifest,
  withDangerousMod,
  withGradleProperties,
  withStringsXml,
} from 'expo/config-plugins';

import { parseColorToARGB } from '../support/helpers';
import { OneSignalLog } from '../support/OneSignalLog';
import { OneSignalPluginProps } from '../types';

const RESOURCE_ROOT_PATH = 'android/app/src/main/res/';
const ONESIGNAL_DISABLE_LOCATION_GRADLE_PROPERTY = 'onesignal.disableLocation';
export const FIREBASE_INSTALLATION_ID_META_DATA = 'firebase_messaging_installation_id_enabled';
export const MIN_FID_REACT_NATIVE_ONESIGNAL_VERSION = '5.5.16';

// The name of each small icon folder resource, and the icon size for that folder.
const SMALL_ICON_DIRS_TO_SIZE: { [name: string]: number } = {
  'drawable-mdpi': 24,
  'drawable-hdpi': 36,
  'drawable-xhdpi': 48,
  'drawable-xxhdpi': 72,
  'drawable-xxxhdpi': 96,
};

// The name of each large icon folder resource, and the icon size for that folder.
const LARGE_ICON_DIRS_TO_SIZE: { [name: string]: number } = {
  'drawable-xxxhdpi': 256,
};

const SMALL_ICON_DEFAULT_NAME = 'ic_stat_onesignal_default';

/** Expo may expose `notification.icon` for legacy Android notification icon config. */
type ExpoConfigWithNotification = ExpoConfig & {
  notification?: { icon?: string };
};

const withSmallIcons: ConfigPlugin<OneSignalPluginProps> = (config, onesignalProps) => {
  const expoConfig = config as ExpoConfigWithNotification;
  if (!onesignalProps.smallIcons && !expoConfig.notification?.icon) {
    return config;
  }

  return withDangerousMod(config, [
    'android',
    async (config) => {
      const modConfig = config as ExpoConfigWithNotification;
      if (modConfig.notification?.icon) {
        await saveIconAsync(
          modConfig.notification.icon,
          config.modRequest.projectRoot,
          SMALL_ICON_DIRS_TO_SIZE,
          SMALL_ICON_DEFAULT_NAME,
        );
      }

      if (onesignalProps.smallIcons) {
        await saveIconsArrayAsync(
          config.modRequest.projectRoot,
          onesignalProps.smallIcons,
          SMALL_ICON_DIRS_TO_SIZE,
          SMALL_ICON_DEFAULT_NAME,
        );
      }
      return config;
    },
  ]);
};

const LARGE_ICON_DEFAULT_NAME = 'ic_onesignal_large_icon_default';

const withLargeIcons: ConfigPlugin<OneSignalPluginProps> = (config, onesignalProps) => {
  if (!onesignalProps.largeIcons) {
    return config;
  }

  return withDangerousMod(config, [
    'android',
    async (config) => {
      if (onesignalProps.largeIcons) {
        await saveIconsArrayAsync(
          config.modRequest.projectRoot,
          onesignalProps.largeIcons,
          LARGE_ICON_DIRS_TO_SIZE,
          LARGE_ICON_DEFAULT_NAME,
        );
      }
      return config;
    },
  ]);
};

const withSmallIconAccentColor: ConfigPlugin<OneSignalPluginProps> = (config, onesignalProps) => {
  if (!onesignalProps.smallIconAccentColor) {
    return config;
  }

  return withStringsXml(config, (config) => {
    const colorInARGB = parseColorToARGB(onesignalProps.smallIconAccentColor ?? '');
    const strings = config.modResults.resources.string ?? [];

    const existingIndex = strings.findIndex(
      (stringEntry) => stringEntry.$?.name === 'onesignal_notification_accent_color',
    );

    const accentColorEntry = {
      $: { name: 'onesignal_notification_accent_color' },
      _: colorInARGB,
    };

    if (existingIndex !== -1) {
      strings[existingIndex] = accentColorEntry;
    } else {
      strings.push(accentColorEntry);
    }

    config.modResults.resources.string = strings;

    return config;
  });
};

type GradlePropertiesItem =
  | { type: 'comment'; value: string }
  | { type: 'empty' }
  | { type: 'property'; key: string; value: string };

const withLocationModuleGradleProperty: ConfigPlugin<OneSignalPluginProps> = (
  config,
  onesignalProps,
) => {
  if (onesignalProps.disableLocation == null) {
    return config;
  }

  return withGradleProperties(config, (config) => {
    const properties = config.modResults as GradlePropertiesItem[];
    const existingIndex = properties.findIndex(
      (entry) =>
        entry.type === 'property' && entry.key === ONESIGNAL_DISABLE_LOCATION_GRADLE_PROPERTY,
    );
    const property: GradlePropertiesItem = {
      type: 'property',
      key: ONESIGNAL_DISABLE_LOCATION_GRADLE_PROPERTY,
      value: onesignalProps.disableLocation ? 'true' : 'false',
    };

    if (existingIndex === -1) {
      properties.push(property);
    } else {
      properties[existingIndex] = property;
    }

    return config;
  });
};

// The flag is app-wide and other SDKs may contribute it via manifest merging, so
// unset leaves the manifest alone and false only removes the app's own entry
// (left behind by an earlier prebuild without --clean) rather than writing "false".
const withFirebaseInstallationIdManifest: ConfigPlugin<OneSignalPluginProps> = (
  config,
  onesignalProps,
) => {
  const enabled = onesignalProps.enableFirebaseInstallationId;
  if (enabled == null) {
    return config;
  }

  if (enabled && !config.android?.googleServicesFile) {
    WarningAggregator.addWarningAndroid(
      'onesignal-expo-plugin',
      "'enableFirebaseInstallationId' is true but 'android.googleServicesFile' is not set. Firebase Installation ID push registration needs your own Firebase project's google-services.json.",
    );
  }

  return withAndroidManifest(config, (config) => {
    if (enabled) {
      assertFidCapableReactNativeOneSignal(config.modRequest?.projectRoot);
    }
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    if (enabled) {
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        FIREBASE_INSTALLATION_ID_META_DATA,
        'true',
      );
    } else {
      AndroidConfig.Manifest.removeMetaDataItemFromMainApplication(
        mainApplication,
        FIREBASE_INSTALLATION_ID_META_DATA,
      );
    }
    return config;
  });
};

// Older SDKs only use the legacy FCM token API, which Firebase disables once the flag is on
// and firebase-messaging is 25.1+, so push registration fails with no fallback.
function assertFidCapableReactNativeOneSignal(projectRoot: string | undefined) {
  if (!projectRoot) {
    return;
  }
  const version = getInstalledReactNativeOneSignalVersion(projectRoot);
  if (version && compareVersions(version, MIN_FID_REACT_NATIVE_ONESIGNAL_VERSION) < 0) {
    throw new Error(
      `onesignal-expo-plugin: 'enableFirebaseInstallationId' requires react-native-onesignal ${MIN_FID_REACT_NATIVE_ONESIGNAL_VERSION} or newer, but ${version} is installed. Upgrade react-native-onesignal or remove 'enableFirebaseInstallationId'.`,
    );
  }
}

function getInstalledReactNativeOneSignalVersion(projectRoot: string): string | undefined {
  try {
    const projectRequire = createRequire(resolve(projectRoot, 'package.json'));
    const packageJsonPath = projectRequire.resolve('react-native-onesignal/package.json');
    return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
  } catch {
    return undefined;
  }
}

function compareVersions(a: string, b: string): number {
  const toParts = (version: string) =>
    version
      .split('-')[0]
      .split('.')
      .map((part) => parseInt(part, 10) || 0);
  const left = toParts(a);
  const right = toParts(b);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

async function saveIconsArrayAsync(
  projectRoot: string,
  icons: string[],
  dirsToSize: { [name: string]: number },
  defaultName: string,
) {
  for (let i = 0; i < icons.length; i++) {
    // the first icon should use OneSignal’s required default drawable name; others keep their file-derived names.
    const outputName = i === 0 ? defaultName : undefined;
    await saveIconAsync(icons[i], projectRoot, dirsToSize, outputName);
  }
}

async function saveIconAsync(
  icon: string,
  projectRoot: string,
  dirsToSize: { [name: string]: number },
  outputName?: string,
) {
  const name = outputName ?? parse(icon).name;

  OneSignalLog.log('Saving icon ' + icon + ' as drawable resource ' + name);

  for (const iconResourceDir in dirsToSize) {
    const path = resolve(projectRoot, RESOURCE_ROOT_PATH, iconResourceDir);

    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }

    const resizedIcon = (
      await generateImageAsync(
        { projectRoot, cacheType: 'onesignal-icon' },
        {
          src: icon,
          width: dirsToSize[iconResourceDir],
          height: dirsToSize[iconResourceDir],
          resizeMode: 'cover',
          backgroundColor: 'transparent',
        },
      )
    ).source;

    writeFileSync(resolve(path, name + '.png'), resizedIcon);
  }
}

const withSoundFiles: ConfigPlugin<OneSignalPluginProps> = (config, onesignalProps) => {
  if (!onesignalProps.sounds) {
    return config;
  }

  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const rawDir = resolve(projectRoot, RESOURCE_ROOT_PATH, 'raw');

      if (!existsSync(rawDir)) {
        mkdirSync(rawDir, { recursive: true });
      }

      for (const soundFile of onesignalProps.sounds!) {
        const sourcePath = resolve(projectRoot, soundFile);
        const fileName = basename(sourcePath).toLowerCase();

        OneSignalLog.log(`Copying sound file ${soundFile} to res/raw/${fileName}`);
        copyFileSync(sourcePath, resolve(rawDir, fileName));
      }

      return config;
    },
  ]);
};

export const withOneSignalAndroid: ConfigPlugin<OneSignalPluginProps> = (config, props) => {
  config = withSmallIcons(config, props);
  config = withLargeIcons(config, props);
  config = withSmallIconAccentColor(config, props);
  config = withLocationModuleGradleProperty(config, props);
  config = withFirebaseInstallationIdManifest(config, props);
  config = withSoundFiles(config, props);
  return config;
};
