import fs from 'fs/promises';
import { NSE_TARGET_NAME } from './iosConstants';
import { getNsePodfileRegex, getNsePodfileSnippet } from './helpers';
import { OneSignalLog } from './OneSignalLog';
import { FileManager } from './FileManager';

export async function updatePodfile(iosPath: string) {
  const podfile = await FileManager.readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(getNsePodfileRegex());

  if (matches) {
    OneSignalLog.log(
      `${NSE_TARGET_NAME} target already added to Podfile. Skipping...`,
    );
    return;
  }

  await fs.appendFile(`${iosPath}/Podfile`, getNsePodfileSnippet());
  OneSignalLog.log(`${NSE_TARGET_NAME} target added to Podfile.`);
}
