import fs from 'fs';
import { NSE_PODFILE_REGEX, NSE_PODFILE_SNIPPET } from './iosConstants';
import { ReaderManager } from './ReaderManager';

export async function updatePodfile(iosPath: string) {
  const podfile = await ReaderManager.readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(NSE_PODFILE_REGEX);

  if (matches) {
    console.info("OneSignalNotificationServiceExtension target already added to Podfile. Skipping...");
  } else {
    fs.appendFile(`${iosPath}/Podfile`, NSE_PODFILE_SNIPPET, (err) => {
      if (err) {
        console.error("Error writing to Podfile");
      }
    })
  }
}
