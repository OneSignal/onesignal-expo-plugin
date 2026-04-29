import { extname } from 'path';

import { ExpoConfig } from '@expo/config-types';

import { ONESIGNAL_PLUGIN_PROPS, OneSignalPluginProps } from '../types/types';
import { OneSignalLog } from './OneSignalLog';

const HEX_COLOR_6_REGEX = /^#?[0-9A-Fa-f]{6}$/;
const HEX_COLOR_8_REGEX = /^#?[0-9A-Fa-f]{8}$/;

/**
 * Converts a hex color string (#RGB, #RRGGBB, or #AARRGGBB) to an
 * 8-character ARGB hex string (no '#') expected by the OneSignal Android SDK.
 */
export function parseColorToARGB(color: string): string {
  const hex = color.replace('#', '');

  if (HEX_COLOR_8_REGEX.test(hex)) {
    return hex.toUpperCase();
  }

  if (HEX_COLOR_6_REGEX.test(hex)) {
    return `FF${hex.toUpperCase()}`;
  }

  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const expanded = hex
      .split('')
      .map((c) => c + c)
      .join('');
    return `FF${expanded.toUpperCase()}`;
  }

  throw new Error(
    `OneSignal Expo Plugin: 'smallIconAccentColor' must be a valid hex color (e.g. "#FF0000"), got "${color}".`,
  );
}

export function validatePluginProps(props: any): void {
  // check the type of each property
  if (typeof props.mode !== 'string') {
    throw new Error("OneSignal Expo Plugin: 'mode' must be a string.");
  }

  if (props.devTeam && typeof props.devTeam !== 'string') {
    throw new Error("OneSignal Expo Plugin: 'devTeam' must be a string.");
  }

  if (props.iPhoneDeploymentTarget && typeof props.iPhoneDeploymentTarget !== 'string') {
    throw new Error("OneSignal Expo Plugin: 'iPhoneDeploymentTarget' must be a string.");
  }

  if (props.smallIcons && !Array.isArray(props.smallIcons)) {
    throw new Error("OneSignal Expo Plugin: 'smallIcons' must be an array.");
  }

  if (props.smallIconAccentColor != null) {
    if (typeof props.smallIconAccentColor !== 'string') {
      throw new Error("OneSignal Expo Plugin: 'smallIconAccentColor' must be a string.");
    }
    parseColorToARGB(props.smallIconAccentColor);
  }

  if (props.largeIcons && !Array.isArray(props.largeIcons)) {
    throw new Error("OneSignal Expo Plugin: 'largeIcons' must be an array.");
  }

  if (props.iosNSEFilePath && typeof props.iosNSEFilePath !== 'string') {
    throw new Error("OneSignal Expo Plugin: 'iosNSEFilePath' must be a string.");
  }

  if (props.appGroupName && typeof props.appGroupName !== 'string') {
    throw new Error("OneSignal Expo Plugin: 'appGroupName' must be a string.");
  }

  if (props.nseBundleIdentifier && typeof props.nseBundleIdentifier !== 'string') {
    throw new Error("OneSignal Expo Plugin: 'nseBundleIdentifier' must be a string.");
  }

  if (props.disableNSE !== undefined && typeof props.disableNSE !== 'boolean') {
    throw new Error("OneSignal Expo Plugin: 'disableNSE' must be a boolean.");
  }

  if (props.sounds !== undefined) {
    if (!Array.isArray(props.sounds)) {
      throw new Error("OneSignal Expo Plugin: 'sounds' must be an array.");
    }
    for (const sound of props.sounds) {
      if (typeof sound !== 'string') {
        throw new Error("OneSignal Expo Plugin: each entry in 'sounds' must be a string path.");
      }
      if (extname(sound).toLowerCase() !== '.wav') {
        throw new Error(
          `OneSignal Expo Plugin: sound file "${sound}" must be a .wav file. Only .wav is supported (works on both iOS and Android).`,
        );
      }
    }
  }

  if (props.liveActivities !== undefined) {
    if (
      props.liveActivities === null ||
      Array.isArray(props.liveActivities) ||
      typeof props.liveActivities !== 'object'
    ) {
      throw new Error("OneSignal Expo Plugin: 'liveActivities' must be an object.");
    }

    const liveActivities = props.liveActivities;
    const liveActivityProps = [
      'targetName',
      'bundleIdentifierSuffix',
      'widgetFilePath',
      'deploymentTarget',
    ];
    for (const prop of Object.keys(liveActivities)) {
      if (!liveActivityProps.includes(prop)) {
        throw new Error(
          `OneSignal Expo Plugin: You have provided an invalid property "${prop}" to 'liveActivities'.`,
        );
      }
      if (typeof liveActivities[prop] !== 'string') {
        throw new Error(`OneSignal Expo Plugin: 'liveActivities.${prop}' must be a string.`);
      }
    }
  }

  // check for extra properties
  const inputProps = Object.keys(props);

  for (const prop of inputProps) {
    if (!ONESIGNAL_PLUGIN_PROPS.includes(prop)) {
      throw new Error(
        `OneSignal Expo Plugin: You have provided an invalid property "${prop}" to the OneSignal plugin.`,
      );
    }
  }
}

export function getAppGroupIdentifier(
  bundleIdentifier: string,
  customAppGroupName?: string,
): string {
  return customAppGroupName ?? `group.${bundleIdentifier}.onesignal`;
}

/**
 * Resolve the Apple development team ID. Prefers `ios.appleTeamId` from the
 * Expo config, falling back to the plugin's deprecated `devTeam` prop.
 */
export function resolveDevTeam(
  config: ExpoConfig,
  props: OneSignalPluginProps,
): string | undefined {
  if (config.ios?.appleTeamId) {
    if (props.devTeam) {
      OneSignalLog.log(
        'Warning: Both "ios.appleTeamId" and the deprecated "devTeam" plugin prop are set. ' +
          '"devTeam" will be ignored. Remove "devTeam" from your plugin config.',
      );
    }
    return config.ios.appleTeamId;
  }

  if (props.devTeam) {
    OneSignalLog.log(
      'Warning: The "devTeam" plugin prop is deprecated and will be removed in a future major release. ' +
        'Set "ios.appleTeamId" in your Expo config instead.',
    );
    return props.devTeam;
  }

  return undefined;
}
