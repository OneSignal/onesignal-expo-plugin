import { describe, expect, test } from 'vite-plus/test';

import {
  liveActivityPodfileRegex,
  liveActivityPodfileSnippet,
  nsePodfileSnippet,
} from './iosConstants';

describe('Live Activity iOS constants', () => {
  test('creates Podfile snippet and regex for target name', () => {
    const snippet = liveActivityPodfileSnippet('OneSignalWidget');

    expect(snippet).toContain("target 'OneSignalWidget' do");
    expect(snippet).toContain("pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'");
    expect(liveActivityPodfileRegex('OneSignalWidget').test(snippet)).toBe(true);
  });
});

describe('NSE iOS constants', () => {
  test('creates the default Podfile snippet', () => {
    const snippet = nsePodfileSnippet();

    expect(snippet).toContain("target 'OneSignalNotificationServiceExtension' do");
    expect(snippet).toContain("pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'");
  });

  test('creates the no-location Podfile snippet', () => {
    const snippet = nsePodfileSnippet(true);

    expect(snippet).toContain("target 'OneSignalNotificationServiceExtension' do");
    expect(snippet).toContain("pod 'OneSignalXCFramework/OneSignal', '>= 5.0', '< 6.0'");
    expect(snippet).toContain(
      "pod 'OneSignalXCFramework/OneSignalInAppMessages', '>= 5.0', '< 6.0'",
    );
  });
});
