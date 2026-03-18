import { extname } from 'path';
import { ONESIGNAL_PLUGIN_PROPS } from '../types/types';

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

  if (
    props.iPhoneDeploymentTarget &&
    typeof props.iPhoneDeploymentTarget !== 'string'
  ) {
    throw new Error(
      "OneSignal Expo Plugin: 'iPhoneDeploymentTarget' must be a string.",
    );
  }

  if (props.smallIcons && !Array.isArray(props.smallIcons)) {
    throw new Error("OneSignal Expo Plugin: 'smallIcons' must be an array.");
  }

  if (props.smallIconAccentColor != null) {
    if (typeof props.smallIconAccentColor !== 'string') {
      throw new Error(
        "OneSignal Expo Plugin: 'smallIconAccentColor' must be a string.",
      );
    }
    parseColorToARGB(props.smallIconAccentColor);
  }

  if (props.largeIcons && !Array.isArray(props.largeIcons)) {
    throw new Error("OneSignal Expo Plugin: 'largeIcons' must be an array.");
  }

  if (props.iosNSEFilePath && typeof props.iosNSEFilePath !== 'string') {
    throw new Error(
      "OneSignal Expo Plugin: 'iosNSEFilePath' must be a string.",
    );
  }

  if (props.appGroupName && typeof props.appGroupName !== 'string') {
    throw new Error("OneSignal Expo Plugin: 'appGroupName' must be a string.");
  }

  if (
    props.nseBundleIdentifier &&
    typeof props.nseBundleIdentifier !== 'string'
  ) {
    throw new Error(
      "OneSignal Expo Plugin: 'nseBundleIdentifier' must be a string.",
    );
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
        throw new Error(
          "OneSignal Expo Plugin: each entry in 'sounds' must be a string path.",
        );
      }
      if (extname(sound).toLowerCase() !== '.wav') {
        throw new Error(
          `OneSignal Expo Plugin: sound file "${sound}" must be a .wav file. Only .wav is supported (works on both iOS and Android).`,
        );
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
