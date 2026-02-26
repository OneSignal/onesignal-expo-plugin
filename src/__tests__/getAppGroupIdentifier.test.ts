import { describe, expect, test } from 'bun:test';
import { getAppGroupIdentifier } from '../support/iosConstants';

describe('getAppGroupIdentifier', () => {
  test('returns default group name when no custom name provided', () => {
    expect(getAppGroupIdentifier('com.example.app')).toBe(
      'group.com.example.app.onesignal',
    );
  });

  test('returns default group name when custom name is undefined', () => {
    expect(getAppGroupIdentifier('com.example.app', undefined)).toBe(
      'group.com.example.app.onesignal',
    );
  });

  test('returns custom group name when provided', () => {
    expect(
      getAppGroupIdentifier('com.example.app', 'group.com.example.custom'),
    ).toBe('group.com.example.custom');
  });

  test('handles empty bundle identifier', () => {
    expect(getAppGroupIdentifier('')).toBe('group..onesignal');
  });
});
