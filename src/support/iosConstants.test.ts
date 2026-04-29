import { describe, expect, test } from 'vite-plus/test';

import { liveActivityPodfileRegex, liveActivityPodfileSnippet } from './iosConstants';

describe('Live Activity iOS constants', () => {
  test('creates Podfile snippet and regex for target name', () => {
    const snippet = liveActivityPodfileSnippet('OneSignalWidget');

    expect(snippet).toContain("target 'OneSignalWidget' do");
    expect(snippet).toContain("pod 'OneSignal/OneSignal', '>= 5.0.0', '< 6.0'");
    expect(liveActivityPodfileRegex('OneSignalWidget').test(snippet)).toBe(true);
  });
});
