import fs from 'fs';
import { GROUP_IDENTIFIER_TEMPLATE_REGEX } from './iosConstants';
import { ReaderManager } from './ReaderManager';

const fileToEdit =`${__dirname}/serviceExtensionFiles/OneSignalNotificationServiceExtension.entitlements`;

export async function updateNSEEntitlements(groupIdentifier: string) {
  let entitlementsFile = await ReaderManager.readFile(fileToEdit);
  entitlementsFile = entitlementsFile.replace(GROUP_IDENTIFIER_TEMPLATE_REGEX, groupIdentifier);

  fs.writeFile(fileToEdit, entitlementsFile, 'utf-8', (err) => {
    if (err) {
      console.error("Error updating OneSignal NSE Entitlement File.");
    }
  })
}
