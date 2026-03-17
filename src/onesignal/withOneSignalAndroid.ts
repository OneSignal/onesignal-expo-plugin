/**
 * Expo config plugin for OneSignal (Android)
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */

import {
  ConfigPlugin,
  withDangerousMod,
  withStringsXml,
} from '@expo/config-plugins';
import { generateImageAsync } from '@expo/image-utils';
import { OneSignalLog } from '../support/OneSignalLog';
import { parseColorToARGB } from '../support/helpers';
import { OneSignalPluginProps } from '../types/types';
import { resolve, parse } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

const RESOURCE_ROOT_PATH = 'android/app/src/main/res/';

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

const withSmallIcons: ConfigPlugin<OneSignalPluginProps> = (
  config,
  onesignalProps,
) => {
  if (!onesignalProps.smallIcons && !config.notification?.icon) {
    return config;
  }

  return withDangerousMod(config, [
    'android',
    async (config) => {
      if (config.notification?.icon) {
        await saveIconAsync(
          config.notification.icon,
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

const withLargeIcons: ConfigPlugin<OneSignalPluginProps> = (
  config,
  onesignalProps,
) => {
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

const withSmallIconAccentColor: ConfigPlugin<OneSignalPluginProps> = (
  config,
  onesignalProps,
) => {
  if (!onesignalProps.smallIconAccentColor) {
    return config;
  }

  return withStringsXml(config, (config) => {
    const colorInARGB = parseColorToARGB(
      onesignalProps.smallIconAccentColor ?? '',
    );
    const strings = config.modResults.resources.string ?? [];

    const existingIndex = strings.findIndex(
      (stringEntry) =>
        stringEntry.$?.name === 'onesignal_notification_accent_color',
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

export const withOneSignalAndroid: ConfigPlugin<OneSignalPluginProps> = (
  config,
  props,
) => {
  config = withSmallIcons(config, props);
  config = withLargeIcons(config, props);
  config = withSmallIconAccentColor(config, props);
  return config;
};
