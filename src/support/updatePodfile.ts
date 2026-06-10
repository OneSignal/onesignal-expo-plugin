import fs from 'fs/promises';

import { FileManager } from './FileManager';
import { NSE_TARGET_NAME, NSE_PODFILE_REGEX, NSE_PODFILE_SNIPPET } from './iosConstants';
import { OneSignalLog } from './OneSignalLog';

const ONESIGNAL_DISABLE_LOCATION_ENV = "ENV['ONESIGNAL_DISABLE_LOCATION']";
const ONESIGNAL_DISABLE_LOCATION_REGEX =
  /^(?:ENV\[['"]ONESIGNAL_DISABLE_LOCATION['"]\]\s*=\s*['"](true|false)['"]|\$OneSignalDisableLocation\s*=\s*(true|false))\s*$/m;

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

export async function updatePodfileLocationModule(iosPath: string, disableLocation: boolean) {
  const podfilePath = `${iosPath}/Podfile`;
  const podfile = await FileManager.readFile(podfilePath);
  const nextValue = `${ONESIGNAL_DISABLE_LOCATION_ENV} = '${disableLocation ? 'true' : 'false'}'`;

  if (ONESIGNAL_DISABLE_LOCATION_REGEX.test(podfile)) {
    await fs.writeFile(podfilePath, podfile.replace(ONESIGNAL_DISABLE_LOCATION_REGEX, nextValue));
    return;
  }

  await fs.writeFile(podfilePath, `${nextValue}\n${podfile}`);
}
