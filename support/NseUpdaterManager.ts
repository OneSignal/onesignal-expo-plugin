import * as fs from 'fs';
import { BUNDLE_SHORT_VERSION_TEMPLATE_REGEX, BUNDLE_VERSION_TEMPLATE_REGEX, GROUP_IDENTIFIER_TEMPLATE_REGEX } from './iosConstants';
import { OneSignalLog } from './OneSignalLog';
import { ReaderManager } from './ReaderManager';

const entitlementsFilePath =`${__dirname}/serviceExtensionFiles/OneSignalNotificationServiceExtension.entitlements`;
const plistFilePath = `${__dirname}/serviceExtensionFiles/OneSignalNotificationServiceExtension-Info.plist`;

const logIfError = (err: NodeJS.ErrnoException | null) => {
  if (err) {
    OneSignalLog.error("Error updating OneSignal NSE Entitlement File.");
  }
}

export default class NseUpdaterManager {
  static async updateNSEEntitlements(groupIdentifier: string) {
    let entitlementsFile = await ReaderManager.readFile(entitlementsFilePath);
    entitlementsFile = entitlementsFile.replace(GROUP_IDENTIFIER_TEMPLATE_REGEX, groupIdentifier);

    fs.writeFile(entitlementsFilePath, entitlementsFile, 'utf-8', (err) => {
      logIfError(err);
    })
  }

  static async updateNSEBundleVersion(version: string) {
    let plistFile = await ReaderManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_VERSION_TEMPLATE_REGEX, version);

    fs.writeFile(plistFilePath, plistFile, 'utf-8', err => {
      logIfError(err);
    });
  }

  static async updateNSEBundleShortVersion(version: string) {
    let plistFile = await ReaderManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_SHORT_VERSION_TEMPLATE_REGEX, version);

    fs.writeFile(plistFilePath, plistFile, 'utf-8', err => {
      logIfError(err);
    });
  }
}
