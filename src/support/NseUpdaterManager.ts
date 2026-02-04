import { FileManager } from './FileManager';
import {
  BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
  BUNDLE_VERSION_TEMPLATE_REGEX,
  GROUP_IDENTIFIER_TEMPLATE_REGEX,
  NSE_TARGET_NAME
} from './iosConstants';

// project `ios/OneSignalNotificationServiceExtension` directory
const entitlementsFileName =`OneSignalNotificationServiceExtension.entitlements`;
const plistFileName = `OneSignalNotificationServiceExtension-Info.plist`;

export default class NseUpdaterManager {
  private nsePath = '';
  constructor(iosPath: string) {
    this.nsePath = `${iosPath}/${NSE_TARGET_NAME}`;
  }

  async updateNSEEntitlements(groupIdentifier: string): Promise<void> {
    const entitlementsFilePath = `${this.nsePath}/${entitlementsFileName}`;
    let entitlementsFile = await FileManager.readFile(entitlementsFilePath);

    entitlementsFile = entitlementsFile.replace(GROUP_IDENTIFIER_TEMPLATE_REGEX, groupIdentifier);
    await FileManager.writeFile(entitlementsFilePath, entitlementsFile);
  }

  async updateNSEBundleVersion(version: string): Promise<void> {
    const plistFilePath = `${this.nsePath}/${plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }

  async updateNSEBundleShortVersion(version: string): Promise<void> {
    const plistFilePath = `${this.nsePath}/${plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_SHORT_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }
}
