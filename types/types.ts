/**
 * OneSignalPluginProps refer to the properties set by the user in their app config file (e.g: app.json)
 */
 export type OneSignalPluginProps = {
  /**
   * (required) Used to configure APNs environment entitlement. "development" or "production"
   */
  mode: Mode;

  /**
   * (optional) Used to configure Apple Team ID. You can find your Apple Team ID by running expo credentials:manager e.g: "91SW8A37CR" 
   */
  devTeam: string;

  /**
   * (optional) Target IPHONEOS_DEPLOYMENT_TARGET value to be used when adding the iOS NSE. A deployment target is nothing more than
   * the minimum version of the operating system the application can run on. This value should match the value in your Podfile e.g: "12.0".
   */
  iPhoneDeploymentTarget: string;

  /**
   * (optional) The small notification icons for Android.  Images will be automatically scaled up/down, the recommended size
   * is 96x96 to always scale down.
   */
  smallIcons?:            string[];

  /**
   * (optional) The large notification icons for Android. Images will be automatically scaled up/down to 256x256.
   */
  largeIcons?:            string[];
};

/**
 * Not to be confused with OneSignalPluginProps, PluginOptions are the *internal* properties used by the config plugin
 * These include a combination of user-defined properties (from OneSignalPluginProps) and other data to pass between functions
 */
export type PluginOptions = {
  iosPath:                  string,
  mode:                     Mode,
  devTeam?:                 string,
  bundleVersion?:           string,
  bundleShortVersion?:      string,
  bundleIdentifier?:        string,
  iPhoneDeploymentTarget?:  string
}

export enum Mode {
  Dev = "development",
  Prod = "production"
}
