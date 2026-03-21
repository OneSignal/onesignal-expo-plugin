import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';
import NseUpdaterManager from './NseUpdaterManager';
import { FileManager } from './FileManager';

vi.mock('./FileManager', () => ({
  FileManager: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));

const NSE_ENTITLEMENTS_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>{{GROUP_IDENTIFIER}}</string>
\t</array>
</dict>
</plist>
`;

const NSE_INFO_PLIST_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDisplayName</key>
\t<string>OneSignalNotificationServiceExtension</string>
\t<key>NSExtension</key>
\t<dict>
\t\t<key>NSExtensionPointIdentifier</key>
\t\t<string>com.apple.usernotifications.service</string>
\t</dict>
</dict>
</plist>`;

describe('NseUpdaterManager', () => {
  let writtenFiles: Record<string, string>;

  beforeEach(() => {
    writtenFiles = {};

    vi.mocked(FileManager.readFile).mockImplementation(async (path: string) => {
      if (path.endsWith('.entitlements')) return NSE_ENTITLEMENTS_TEMPLATE;
      if (path.endsWith('-Info.plist')) return NSE_INFO_PLIST_TEMPLATE;
      throw new Error(`Unexpected file read: ${path}`);
    });

    vi.mocked(FileManager.writeFile).mockImplementation(
      async (path: string, contents: string) => {
        writtenFiles[path] = contents;
      },
    );
  });

  test('updateNSEEntitlements replaces template with group identifier', async () => {
    const updater = new NseUpdaterManager('/ios');
    await updater.updateNSEEntitlements('group.com.example.app.onesignal');

    const written = Object.values(writtenFiles)[0];
    expect(written).toContain('group.com.example.app.onesignal');
    expect(written).not.toContain('{{GROUP_IDENTIFIER}}');
  });

  test('updateNSEEntitlements works with custom group name', async () => {
    const updater = new NseUpdaterManager('/ios');
    await updater.updateNSEEntitlements('group.com.example.custom');

    const written = Object.values(writtenFiles)[0];
    expect(written).toContain('group.com.example.custom');
  });

  test('updateNSEInfoPlistAppGroupKey inserts key into plist', async () => {
    const updater = new NseUpdaterManager('/ios');
    await updater.updateNSEInfoPlistAppGroupKey('group.com.example.custom');

    const written = Object.values(writtenFiles)[0];
    expect(written).toContain('<key>OneSignal_app_groups_key</key>');
    expect(written).toContain('<string>group.com.example.custom</string>');
    expect(written).toContain('</dict>\n</plist>');
  });

  test('uses default target name for file paths', async () => {
    const updater = new NseUpdaterManager('/ios');
    await updater.updateNSEEntitlements('group.com.example.app.onesignal');

    const paths = Object.keys(writtenFiles);
    expect(paths[0]).toBe(
      '/ios/OneSignalNotificationServiceExtension/OneSignalNotificationServiceExtension.entitlements',
    );
  });
});
