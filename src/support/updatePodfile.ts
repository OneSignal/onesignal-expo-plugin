import fs from 'fs/promises';

import { FileManager } from './FileManager';
import { NSE_TARGET_NAME, NSE_PODFILE_REGEX, NSE_PODFILE_SNIPPET } from './iosConstants';
import { OneSignalLog } from './OneSignalLog';

export async function updatePodfile(iosPath: string) {
  const podfile = await FileManager.readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(NSE_PODFILE_REGEX);

  if (matches) {
    OneSignalLog.log(`${NSE_TARGET_NAME} target already added to Podfile. Skipping...`);
    return;
  }

  await fs.appendFile(`${iosPath}/Podfile`, NSE_PODFILE_SNIPPET);
  OneSignalLog.log(`${NSE_TARGET_NAME} target added to Podfile.`);
}
