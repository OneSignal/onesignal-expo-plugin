import { describe, expect, test } from 'bun:test';
import { validatePluginProps } from '../support/helpers';

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
});
