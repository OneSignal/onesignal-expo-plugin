<h1 align="center">Welcome to onesignal-expo-plugin 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0--beta7-blue.svg?cacheSeconds=2592000" />
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

## 🚧 In Beta 🚧
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
```

## Configuration in app.json / app.config.js
### Plugin
Add the plugin to the [plugin array](https://docs.expo.dev/versions/latest/config/app/):

**app.json**
```json
{
  "plugins": [
    [
      "onesignal-expo-plugin",
      {
        "mode": "development",
        "devTeam": "91SW8A37CR"
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
        mode: process.env.NODE_ENV || "development",
        devTeam: "91SW8A37CR"
      }
    ]
  ]
};
```

#### Plugin Options
* `mode`: used to configure [APNs environment](https://developer.apple.com/documentation/bundleresources/entitlements/aps-environment) entitlement.
   - `"development"`
   - `"production"`
* `devTeam`: *optional* - used to configure Apple Team ID. You can find your Apple Team ID by running `expo credentials:manager`.

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

## Run
```sh
$ expo prebuild

# Build your native iOS project
$ expo run:ios

# Build your native Android project
$ expo run:android
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

Copyright © 2021 [OneSignal](https://github.com/OneSignal).<br />
This project is [MIT](https://github.com/OneSignal/onesignal-expo-plugin/blob/main/LICENSE) licensed.
