import { describe, expect, test } from 'vite-plus/test';

import { parseColorToARGB, validatePluginProps } from './helpers';

describe('parseColorToARGB', () => {
  test('converts 6-digit hex with # to ARGB', () => {
    expect(parseColorToARGB('#FF0000')).toBe('FFFF0000');
  });

  test('converts 6-digit hex without # to ARGB', () => {
    expect(parseColorToARGB('279FD2')).toBe('FF279FD2');
  });

  test('converts lowercase hex to uppercase', () => {
    expect(parseColorToARGB('#c0ffee')).toBe('FFC0FFEE');
  });

  test('passes through 8-digit hex (already has alpha)', () => {
    expect(parseColorToARGB('#80FF0000')).toBe('80FF0000');
  });

  test('expands 3-digit shorthand hex', () => {
    expect(parseColorToARGB('#F00')).toBe('FFFF0000');
    expect(parseColorToARGB('abc')).toBe('FFAABBCC');
  });

  test('throws on invalid color strings', () => {
    expect(() => parseColorToARGB('red')).toThrow('valid hex color');
    expect(() => parseColorToARGB('#GGGGGG')).toThrow('valid hex color');
    expect(() => parseColorToARGB('')).toThrow('valid hex color');
    expect(() => parseColorToARGB('#12345')).toThrow('valid hex color');
  });
});

describe('validatePluginProps', () => {
  const validProps = { mode: 'development' };

  test('accepts valid props with only mode', () => {
    expect(() => validatePluginProps(validProps)).not.toThrow();
  });

  test('accepts valid appGroupName string', () => {
    expect(() =>
      validatePluginProps({
        ...validProps,
        appGroupName: 'group.com.example.custom',
      }),
    ).not.toThrow();
  });

  test('rejects non-string appGroupName', () => {
    expect(() => validatePluginProps({ ...validProps, appGroupName: 123 })).toThrow(
      "'appGroupName' must be a string",
    );
  });

  test('rejects unknown properties', () => {
    expect(() => validatePluginProps({ ...validProps, unknownProp: 'value' })).toThrow(
      'invalid property "unknownProp"',
    );
  });

  test('allows appGroupName to be omitted', () => {
    expect(() => validatePluginProps(validProps)).not.toThrow();
  });

  test('accepts valid nseBundleIdentifier string', () => {
    expect(() =>
      validatePluginProps({
        ...validProps,
        nseBundleIdentifier: 'ExpoNSE',
      }),
    ).not.toThrow();
  });

  test('rejects non-string nseBundleIdentifier', () => {
    expect(() => validatePluginProps({ ...validProps, nseBundleIdentifier: 123 })).toThrow(
      "'nseBundleIdentifier' must be a string",
    );
  });

  test('accepts disableNSE as true', () => {
    expect(() => validatePluginProps({ ...validProps, disableNSE: true })).not.toThrow();
  });

  test('accepts disableNSE as false', () => {
    expect(() => validatePluginProps({ ...validProps, disableNSE: false })).not.toThrow();
  });

  test('rejects non-boolean disableNSE', () => {
    expect(() => validatePluginProps({ ...validProps, disableNSE: 'true' })).toThrow(
      "'disableNSE' must be a boolean",
    );
  });

  test('allows disableNSE to be omitted', () => {
    expect(() => validatePluginProps(validProps)).not.toThrow();
  });

  test('accepts valid 6-digit hex smallIconAccentColor', () => {
    expect(() =>
      validatePluginProps({ ...validProps, smallIconAccentColor: '#FF0000' }),
    ).not.toThrow();
  });

  test('accepts valid 8-digit hex smallIconAccentColor', () => {
    expect(() =>
      validatePluginProps({ ...validProps, smallIconAccentColor: '#80FF0000' }),
    ).not.toThrow();
  });

  test('accepts valid 3-digit hex smallIconAccentColor', () => {
    expect(() =>
      validatePluginProps({ ...validProps, smallIconAccentColor: '#F00' }),
    ).not.toThrow();
  });

  test('rejects non-string smallIconAccentColor', () => {
    expect(() => validatePluginProps({ ...validProps, smallIconAccentColor: 123 })).toThrow(
      "'smallIconAccentColor' must be a string",
    );
  });

  test('rejects invalid hex smallIconAccentColor', () => {
    expect(() => validatePluginProps({ ...validProps, smallIconAccentColor: 'red' })).toThrow(
      'valid hex color',
    );
    expect(() => validatePluginProps({ ...validProps, smallIconAccentColor: '#GGGGGG' })).toThrow(
      'valid hex color',
    );
  });

  test('accepts valid sounds array', () => {
    expect(() =>
      validatePluginProps({
        ...validProps,
        sounds: ['./assets/notification.wav'],
      }),
    ).not.toThrow();
  });

  test('accepts empty sounds array', () => {
    expect(() => validatePluginProps({ ...validProps, sounds: [] })).not.toThrow();
  });

  test('rejects non-array sounds', () => {
    expect(() => validatePluginProps({ ...validProps, sounds: 'notification.wav' })).toThrow(
      "'sounds' must be an array",
    );
  });

  test('rejects sounds array with non-string entries', () => {
    expect(() => validatePluginProps({ ...validProps, sounds: [123] })).toThrow(
      "each entry in 'sounds' must be a string",
    );
  });

  test('rejects non-wav sound files', () => {
    expect(() => validatePluginProps({ ...validProps, sounds: ['./assets/tone.mp3'] })).toThrow(
      'must be a .wav file',
    );
    expect(() => validatePluginProps({ ...validProps, sounds: ['./assets/ring.ogg'] })).toThrow(
      'must be a .wav file',
    );
    expect(() => validatePluginProps({ ...validProps, sounds: ['./assets/chime.aiff'] })).toThrow(
      'must be a .wav file',
    );
  });

  test('accepts .wav with any casing', () => {
    expect(() =>
      validatePluginProps({ ...validProps, sounds: ['./assets/alert.WAV'] }),
    ).not.toThrow();
  });

  test('allows sounds to be omitted', () => {
    expect(() => validatePluginProps(validProps)).not.toThrow();
  });

  test('accepts liveActivities object with string props', () => {
    expect(() =>
      validatePluginProps({
        ...validProps,
        liveActivities: {
          targetName: 'MyWidget',
          bundleIdentifierSuffix: 'widget',
          widgetFilePath: './widgets/MyWidget.swift',
          deploymentTarget: '16.2',
        },
      }),
    ).not.toThrow();
  });

  test('rejects invalid liveActivities values', () => {
    expect(() => validatePluginProps({ ...validProps, liveActivities: true })).toThrow(
      "'liveActivities' must be an object",
    );
    expect(() =>
      validatePluginProps({ ...validProps, liveActivities: { targetName: 123 } }),
    ).toThrow("'liveActivities.targetName' must be a string");
    expect(() =>
      validatePluginProps({ ...validProps, liveActivities: { unknown: 'value' } }),
    ).toThrow('invalid property "unknown"');
  });
});
