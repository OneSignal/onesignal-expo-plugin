<h1 align="center">Welcome to onesignal-expo-plugin 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/onesignal-expo-plugin" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/onesignal-expo-plugin.svg">
  </a>
  <a href="https://github.com/OneSignal/onesignal-expo-plugin#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/OneSignal/onesignal-expo-plugin/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://twitter.com/onesignal" target="_blank">
    <img alt="Twitter: onesignal" src="https://img.shields.io/twitter/follow/onesignal.svg?style=social" />
  </a>
</p>

> The OneSignal Expo plugin allows you to use OneSignal without leaving the managed workflow. Developed in collaboration with SweetGreen.

* 🏠 [Homepage](https://github.com/OneSignal/onesignal-expo-plugin#readme)
* 🖤 [npm](https://www.npmjs.com/package/onesignal-expo-plugin)

## Overview
This plugin is an [Expo Config Plugin](https://docs.expo.dev/guides/config-plugins/). It extends the Expo config to allow customizing the prebuild phase of managed workflow builds (no need to eject to a bare workflow). For the purposes of OneSignal integration, the plugin facilitates automatically generating/configuring the necessary native code files needed to get the [OneSignal React-Native SDK](https://github.com/OneSignal/react-native-onesignal) to work. You can think of adding a plugin as adding custom native code.

## Supported environments:
* [The Expo run commands](https://docs.expo.dev/workflow/customizing/) (`expo run:[android|ios]`)
* [Custom clients](https://blog.expo.dev/introducing-custom-development-clients-5a2c79a9ddf8)
* [EAS Build](https://docs.expo.dev/build/introduction/)

---

## Install

```sh
expo install onesignal-expo-plugin

# npm
npm install react-native-onesignal

# yarn
yarn add react-native-onesignal
```

## Configuration in app.json / app.config.js
### Plugin
Add the plugin to the **front** of the [plugin array](https://docs.expo.dev/versions/latest/config/app/). It should be added automatically if you ran `expo install`. Just make sure it is the first plugin in the array and to configure any desired plugin props:

**app.json**
```json
{
  "plugins": [
    [
      "onesignal-expo-plugin",
      {
        "mode": "development",
      }
    ]
  ]
}
```

or

**app.config.js**
```js
export default {
  ...
  plugins: [
    [
      "onesignal-expo-plugin",
      {
        mode: "development",
      }
    ]
  ]
};
```

#### Plugin Prop
You can pass props to the plugin config object to configure:

| Plugin Prop              |          |                                                                                                                                                                                                                                                                                                                                |
|--------------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `mode`                   | **required** | Used to configure  [APNs environment](https://developer.apple.com/documentation/bundleresources/entitlements/aps-environment)  entitlement.  `"development"` or  `"production"`                                                                                                                                            |
| `devTeam`                | optional | Used to configure Apple Team ID. You can find your Apple Team ID by running `expo credentials:manager`  e.g: `"91SW8A37CR"`                                                                                                                                                                                                    |
| `iPhoneDeploymentTarget` | optional | Target `IPHONEOS_DEPLOYMENT_TARGET` value to be used when adding the iOS [NSE](https://documentation.onesignal.com/docs/service-extensions). A deployment target is nothing more than the minimum version of the operating system the application can run on. This value should match the value in your Podfile e.g: `"12.0"`. |
| `smallIcons`             | optional | An array of local paths to small notification icons for Android.  Image should be white, transparent, and 96x96 in size.  Input images will be automatically scaled down and placed in the appropriate resource folders.  e.g: `["./assets/ic_stat_onesignal_default.png"]`. See https://documentation.onesignal.com/docs/customize-notification-icons#small-notification-icons.  |
| `largeIcons`             | optional | An array of local paths to large notification icons for Android.  Image should be white, transparent, and 256x256 in size.  e.g: `["./assets/ic_onesignal_large_icon_default.png"]`. See https://documentation.onesignal.com/docs/customize-notification-icons#large-notification-icons.                                                                                                |

### OneSignal App ID
Add your OneSignal App ID to your [Expo constants via the `extra` param](https://docs.expo.dev/versions/latest/config/app/):

**Example:**
```json
{
  "extra": {
    "oneSignalAppId": "<YOUR APP ID HERE>"
  }
}
```

You can then access the value to pass to the `setAppId` function:

```js
import OneSignal from 'react-native-onesignal';
import Constants from "expo-constants";
OneSignal.setAppId(Constants.manifest.extra.oneSignalAppId);
```

Alternatively, pass the app ID directly to the function:

```js
OneSignal.setAppId("YOUR-ONESIGNAL-APP-ID");
```

### Versioning
In your configuration file, make sure you set:

| Property             | Details                                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `version`         | Your app version. Corresponds to `CFBundleShortVersionString` on iOS. This value will be used in your NSE* target's plist file.                                               |
| `ios.buildNumber` | Build number for your iOS standalone app. Corresponds to `CFBundleVersion` and must match Apple's specified format. This value will be used in your NSE* target's plist file. |

\* NSE = Notification Service Extension. Learn more about the NSE [here](https://documentation.onesignal.com/docs/service-extensions).

## EAS (Expo Application Services)
See our [EAS documentation](EAS.md) for help with EAS.

### iOS Credentials: OneSignal + EAS
To distribute your iOS application via EAS, you will need to ensure your credentials are set up correctly. See our [credentials setup guide for instructions](IOS_CREDENTIALS_EAS.md).

## Prebuild (optional)
Prebuilding in Expo will result in the generation of the native runtime code for the project (and `ios` and `android` directories being built). By prebuilding, we automatically link and configure the native modules that have implemented CocoaPods, autolinking, and other config plugins. You can think of prebuild like a native code bundler.

When you run `expo prebuild` we enter into a custom managed workflow which provides most of the benefits of bare workflows and managed workflows at the same time.

#### Why should I prebuild?
It may make sense to prebuild locally to inspect config plugin changes and help in debugging issues.

#### Run
```sh
expo prebuild
```

```sh
# nukes changes and rebuilds
expo prebuild --clean
```

**EAS Note:** if you choose to stay in a fully managed workflow by not prebuilding, EAS will still run `expo prebuild` at build time. You can also prebuild locally but remain in a fully managed workflow by adding the `android` and `ios` directories to your .gitignore.

## Run
The following commands will prebuild *and* run your application. Note that for iOS, push notifications will **not** work in the Simulator.
```sh
# Build and run your native iOS project
expo run:ios

# Build and run your native Android project
expo run:android
```

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/OneSignal/onesignal-expo-plugin/issues).

## Show your support

Give a ⭐️ if this project helped you!

## OneSignal

* Website: https://onesignal.com
* Twitter: [@onesignal](https://twitter.com/onesignal)
* Github: [@OneSignal](https://github.com/OneSignal)
* LinkedIn: [@onesignal](https://linkedin.com/company/onesignal)

## 📝 License

Copyright © 2022 [OneSignal](https://github.com/OneSignal).<br />
This project is [MIT](https://github.com/OneSignal/onesignal-expo-plugin/blob/main/LICENSE) licensed.
