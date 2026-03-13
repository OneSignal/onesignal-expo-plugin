import { describe, expect, test } from 'bun:test';
import {
  validatePluginProps,
  getNsePodfileSnippet,
  getNsePodfileRegex,
  getNseExtFiles,
} from '../support/helpers';

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
    expect(() =>
      validatePluginProps({ ...validProps, appGroupName: 123 }),
    ).toThrow("'appGroupName' must be a string");
  });

  test('rejects unknown properties', () => {
    expect(() =>
      validatePluginProps({ ...validProps, unknownProp: 'value' }),
    ).toThrow('invalid property "unknownProp"');
  });

  test('allows appGroupName to be omitted', () => {
    expect(() => validatePluginProps(validProps)).not.toThrow();
  });

  test('accepts valid nseBundleIdentifier string', () => {
    expect(() =>
      validatePluginProps({
        ...validProps,
        nseBundleIdentifier: 'com.example.app.MyNSE',
      }),
    ).not.toThrow();
  });
});

describe('getNsePodfileSnippet', () => {
  test('contains default target name and OneSignal pod', () => {
    const snippet = getNsePodfileSnippet();
    expect(snippet).toContain(
      "target 'OneSignalNotificationServiceExtension' do",
    );
    expect(snippet).toContain("pod 'OneSignalXCFramework'");
  });
});

describe('getNsePodfileRegex', () => {
  test('matches default target name', () => {
    const regex = getNsePodfileRegex();
    expect(regex.test("target 'OneSignalNotificationServiceExtension'")).toBe(
      true,
    );
  });
});

describe('getNseExtFiles', () => {
  test('returns default extension files', () => {
    const files = getNseExtFiles();
    expect(files).toEqual([
      'NotificationService.h',
      'OneSignalNotificationServiceExtension.entitlements',
      'OneSignalNotificationServiceExtension-Info.plist',
    ]);
  });
});
