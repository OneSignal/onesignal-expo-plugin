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

  test('accepts valid nseTargetName string', () => {
    expect(() =>
      validatePluginProps({ ...validProps, nseTargetName: 'MyNSE' }),
    ).not.toThrow();
  });
});

describe('getNsePodfileSnippet', () => {
  test('uses default target name', () => {
    const snippet = getNsePodfileSnippet();
    expect(snippet).toContain(
      "target 'OneSignalNotificationServiceExtension' do",
    );
    expect(snippet).toContain("pod 'OneSignalXCFramework'");
  });

  test('uses custom target name', () => {
    const snippet = getNsePodfileSnippet('MyNSE');
    expect(snippet).toContain("target 'MyNSE' do");
    expect(snippet).not.toContain('OneSignalNotificationServiceExtension');
  });
});

describe('getNsePodfileRegex', () => {
  test('matches default target name', () => {
    const regex = getNsePodfileRegex();
    expect(regex.test("target 'OneSignalNotificationServiceExtension'")).toBe(
      true,
    );
  });

  test('matches custom target name', () => {
    const regex = getNsePodfileRegex('MyNSE');
    expect(regex.test("target 'MyNSE'")).toBe(true);
    expect(
      regex.test("target 'OneSignalNotificationServiceExtension'"),
    ).toBe(false);
  });
});

describe('getNseExtFiles', () => {
  test('uses default target name', () => {
    const files = getNseExtFiles();
    expect(files).toEqual([
      'NotificationService.h',
      'OneSignalNotificationServiceExtension.entitlements',
      'OneSignalNotificationServiceExtension-Info.plist',
    ]);
  });

  test('uses custom target name', () => {
    const files = getNseExtFiles('MyNSE');
    expect(files).toEqual([
      'NotificationService.h',
      'MyNSE.entitlements',
      'MyNSE-Info.plist',
    ]);
  });
});
