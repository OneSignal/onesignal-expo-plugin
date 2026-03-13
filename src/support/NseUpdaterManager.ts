import { FileManager } from './FileManager';
import {
  BUNDLE_SHORT_VERSION_TEMPLATE_REGEX,
  BUNDLE_VERSION_TEMPLATE_REGEX,
  GROUP_IDENTIFIER_TEMPLATE_REGEX,
  NSE_TARGET_NAME,
} from './iosConstants';

export default class NseUpdaterManager {
  private nsePath: string;
  private entitlementsFileName: string;
  private plistFileName: string;

  constructor(iosPath: string, nseTargetName = NSE_TARGET_NAME) {
    this.nsePath = `${iosPath}/${nseTargetName}`;
    this.entitlementsFileName = `${nseTargetName}.entitlements`;
    this.plistFileName = `${nseTargetName}-Info.plist`;
  }

  async updateNSEEntitlements(groupIdentifier: string): Promise<void> {
    const entitlementsFilePath = `${this.nsePath}/${this.entitlementsFileName}`;
    let entitlementsFile = await FileManager.readFile(entitlementsFilePath);

    entitlementsFile = entitlementsFile.replace(
      GROUP_IDENTIFIER_TEMPLATE_REGEX,
      groupIdentifier,
    );
    await FileManager.writeFile(entitlementsFilePath, entitlementsFile);
  }

  async updateNSEBundleVersion(version: string): Promise<void> {
    const plistFilePath = `${this.nsePath}/${this.plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }

  async updateNSEBundleShortVersion(version: string): Promise<void> {
    const plistFilePath = `${this.nsePath}/${this.plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    plistFile = plistFile.replace(BUNDLE_SHORT_VERSION_TEMPLATE_REGEX, version);
    await FileManager.writeFile(plistFilePath, plistFile);
  }

  async updateNSEInfoPlistAppGroupKey(appGroupName: string): Promise<void> {
    const plistFilePath = `${this.nsePath}/${this.plistFileName}`;
    let plistFile = await FileManager.readFile(plistFilePath);
    const appGroupEntry = `\t<key>OneSignal_app_groups_key</key>\n\t<string>${appGroupName}</string>\n</dict>\n</plist>`;
    plistFile = plistFile.replace('</dict>\n</plist>', appGroupEntry);
    await FileManager.writeFile(plistFilePath, plistFile);
  }
}
