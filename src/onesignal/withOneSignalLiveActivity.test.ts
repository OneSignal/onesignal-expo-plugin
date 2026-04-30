import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { OneSignalLog } from '../support/OneSignalLog';
import type { OneSignalPluginProps } from '../types/types';
import { resolveLiveActivityDeploymentTarget } from './withOneSignalLiveActivity';

const baseProps: OneSignalPluginProps = { mode: 'production' };

describe('resolveLiveActivityDeploymentTarget', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(OneSignalLog, 'log');
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test('defaults to 16.2 when liveActivities.deploymentTarget is unset', () => {
    expect(resolveLiveActivityDeploymentTarget({ ...baseProps, liveActivities: {} })).toBe('16.2');
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('returns the requested value when >= 16.2', () => {
    expect(
      resolveLiveActivityDeploymentTarget({
        ...baseProps,
        liveActivities: { deploymentTarget: '17.2' },
      }),
    ).toBe('17.2');
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('clamps to 16.2 and warns when below the minimum', () => {
    expect(
      resolveLiveActivityDeploymentTarget({
        ...baseProps,
        liveActivities: { deploymentTarget: '15.0' },
      }),
    ).toBe('16.2');
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('below the minimum');
  });

  test('ignores the NSE iPhoneDeploymentTarget prop', () => {
    expect(
      resolveLiveActivityDeploymentTarget({
        ...baseProps,
        iPhoneDeploymentTarget: '18.0',
        liveActivities: {},
      }),
    ).toBe('16.2');
  });
});
