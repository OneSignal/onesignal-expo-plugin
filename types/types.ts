/**
 * OneSignalPluginProps refer to the properties set by the user in their app config file (e.g: app.json)
 */
 export type OneSignalPluginProps = {
  /**
   * (iOS only) Environment name and bundle identifier
   */
  mode: Mode;
  devTeam: string;
  iPhoneDeploymentTarget: string;
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
