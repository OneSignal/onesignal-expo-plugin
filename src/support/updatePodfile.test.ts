import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { afterEach, describe, expect, test } from 'vite-plus/test';

import { updatePodfile, updatePodfileLocationModule } from './updatePodfile';

const tempDirs: string[] = [];

async function createIosProject(podfile: string): Promise<string> {
  const iosPath = await mkdtemp(path.join(tmpdir(), 'onesignal-podfile-'));
  tempDirs.push(iosPath);
  await writeFile(path.join(iosPath, 'Podfile'), podfile);
  return iosPath;
}

async function readPodfile(iosPath: string): Promise<string> {
  return readFile(path.join(iosPath, 'Podfile'), 'utf8');
}

describe('updatePodfileLocationModule', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  test('adds the disable location flag to the top of the Podfile', async () => {
    const iosPath = await createIosProject("platform :ios, '15.1'\n");

    await updatePodfileLocationModule(iosPath, true);

    await expect(readPodfile(iosPath)).resolves.toBe(
      "ENV['ONESIGNAL_DISABLE_LOCATION'] = 'true'\nplatform :ios, '15.1'\n",
    );
  });

  test('updates an existing disable location flag', async () => {
    const iosPath = await createIosProject(
      "ENV['ONESIGNAL_DISABLE_LOCATION'] = 'true'\nplatform :ios, '15.1'\n",
    );

    await updatePodfileLocationModule(iosPath, false);

    await expect(readPodfile(iosPath)).resolves.toBe(
      "ENV['ONESIGNAL_DISABLE_LOCATION'] = 'false'\nplatform :ios, '15.1'\n",
    );
  });

  test('migrates the legacy disable location Podfile global', async () => {
    const iosPath = await createIosProject(
      "$OneSignalDisableLocation = true\nplatform :ios, '15.1'\n",
    );

    await updatePodfileLocationModule(iosPath, true);

    await expect(readPodfile(iosPath)).resolves.toBe(
      "ENV['ONESIGNAL_DISABLE_LOCATION'] = 'true'\nplatform :ios, '15.1'\n",
    );
  });
});

describe('updatePodfile', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  test('adds the no-location NSE target dependency when location is disabled', async () => {
    const iosPath = await createIosProject("platform :ios, '15.1'\n");

    await updatePodfile(iosPath, true);

    await expect(readPodfile(iosPath)).resolves.toContain(
      "pod 'OneSignalXCFramework/OneSignalExtension', '>= 5.0', '< 6.0'",
    );
  });
});
