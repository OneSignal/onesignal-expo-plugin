import fs from 'fs/promises';
import {
  NSE_TARGET_NAME,
  getNsePodfileRegex,
  getNsePodfileSnippet,
} from './iosConstants';
import { OneSignalLog } from './OneSignalLog';
import { FileManager } from './FileManager';

export async function updatePodfile(iosPath: string, nseTargetName = NSE_TARGET_NAME) {
  const podfile = await FileManager.readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(getNsePodfileRegex(nseTargetName));

  if (matches) {
    OneSignalLog.log(
      `${nseTargetName} target already added to Podfile. Skipping...`,
    );
    return;
  }

  await fs.appendFile(`${iosPath}/Podfile`, getNsePodfileSnippet(nseTargetName));
  OneSignalLog.log(`${nseTargetName} target added to Podfile.`);
}
