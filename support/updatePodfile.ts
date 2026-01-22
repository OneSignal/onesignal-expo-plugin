import fs from 'fs';
import { NSE_PODFILE_REGEX, NSE_PODFILE_SNIPPET } from './iosConstants';
import { OneSignalLog } from './OneSignalLog';
import { FileManager } from './FileManager';

export async function updatePodfile(iosPath: string) {
  const podfile = await FileManager.readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(NSE_PODFILE_REGEX);

  if (matches) {
    OneSignalLog.log("OneSignalNotificationServiceExtension target already added to Podfile. Skipping...");
  } else {
    try {
      fs.appendFileSync(`${iosPath}/Podfile`, NSE_PODFILE_SNIPPET);
      OneSignalLog.log("OneSignalNotificationServiceExtension target added to Podfile.");
    } catch (err) {
      OneSignalLog.error("Error writing to Podfile: " + err);
    }
  }
}
