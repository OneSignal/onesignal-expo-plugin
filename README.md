<h1 align="center">Welcome to onesignal-expo-plugin 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0--beta1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/OneSignal/onesignal-expo-plugin#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/OneSignal/onesignal-expo-plugin/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/OneSignal/onesignal-expo-plugin/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/OneSignal/onesignal-expo-plugin" />
  </a>
  <a href="https://twitter.com/onesignal" target="_blank">
    <img alt="Twitter: onesignal" src="https://img.shields.io/twitter/follow/onesignal.svg?style=social" />
  </a>
</p>

> The OneSignal Expo plugin allows you to use OneSignal without leaving the managed workflow. Developed in collaboration with SweetGreen.

### 🏠 [Homepage](https://github.com/OneSignal/onesignal-expo-plugin#readme)

## Install

```sh
expo install onesignal-expo-plugin
```

**Note:** this does not install the [OneSignal SDK](https://github.com/OneSignal/react-native-onesignal).

## Configuration in app.json / app.config.js
### Plugin
Add the `withOneSignal.js` file to the [plugin array](https://docs.expo.dev/versions/latest/config/app/):

```json
{
  "plugins": [
    "./node_modules/onesignal-expo-plugin/build/onesignal/withOneSignal.js"
  ]
}
```

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
import Constants from "expo-constants";
OneSignal.setAppId(Constants.manifest.extra.oneSignalAppId);
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
This project is [MIT](https://github.com/OneSignal/onesignal-expo-plugin/blob/master/LICENSE) licensed.
