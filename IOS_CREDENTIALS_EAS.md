# iOS Credentials Guide: OneSignal + EAS
## Overview
To distribute your iOS application, you must set up all the credentials required by Apple. The 3 primary iOS credentials are:
* Distribution certificate
* Provisioning profiles
* Push notification certificate

If you are using EAS, you may be letting Expo handle all your credentials. This is fine for your distribution and provisioning credentials. However, the push notification certificate *must* be set up separately since you are using OneSignal.

### Push Notification Certificate
To set up OneSignal on iOS, you will need a [push notification certificate](https://documentation.onesignal.com/docs/generate-an-ios-push-certificate). The push certificate is used to send notifications to devices and has nothing to do with the build process. After you have uploaded the certificate to OneSignal, it should just work.

### Capabilities
As of eas-cli `v0.52.0`, the previous capabilities issues should now be resolved. See the [release notes](https://github.com/expo/eas-cli/releases/tag/v0.52.0) for details.

You can still view the old instructions by clicking below.

<details>
  <summary>Click to expand</summary>

---
To receive notifications, you must add the `aps-environment` capability (Push Notifications) to your app at build time. The OneSignal plugin tries to facilitate this as much as possible but there could be complications if you added other capabilities/entitlements or another config plugin did. This is because EAS doesn't currently respect entitlement files on a per-target basis. If there are more than one entitlements files, it simply picks one and applies it to both targets.

Due to this, there are two setup paths:
1. A **simple setup** is one in which the only [capability](https://docs.expo.dev/build-reference/ios-capabilities/) on your main target is "Push Notifications."
2. A more **complex setup** is one in which you have other capabilities.

This also affects how you should set up your credentials. Use the following table to know whether to proceed with local or managed credentials:
| Push Notification capability only |                                                                       |
|-----------------------------------|-----------------------------------------------------------------------|
| Local credentials                 | Works but unnecessary to go through extra effort to use local signing |
| Managed credentials               | Works (simple setup)                                                                 |

| Multiple capabilities |                                  |
|-----------------------|----------------------------------|
| Local credentials     | Works but requires complex setup |
| Managed credentials   | Works unreliably                 |

If you are unsure, run `expo prebuild` and look at the native entitlements file of your main target (in `ios` directory). Other config plugins may be adding capabilities here. Or check the full [capabilities](https://docs.expo.dev/build-reference/ios-capabilities/#supported-capabilities) list supported by Expo.


#### Simple setup explanation
Since there is only one capability (Push Notifications) required by your app, everything should just work. OneSignal will automatically add the capability to your app along with the necessary App Groups and EAS should sync them with your Apple Developer account. You can choose to use managed signing on EAS without a problem. This works because OneSignal will add the capability to both targets' entitlements files.

#### Complex setup explanation
Having additional capabilities on your app will result in a more complex setup, including having to use local credentials. The following is an explanation of why. It is not imperative to understand but we have included it for context.

The OneSignal plugin will create an additional target: `OneSignalNotificationServiceExtension`. This target is the iOS service extension that adds support for Confirmed Deliveries, badges, media attachments, action buttons, and influenced opens (Firebase Analytics). Learn more [here](https://documentation.onesignal.com/docs/service-extensions). The plugin will automatically add app groups to both targets' entitlements files which are required if you want to make use of these features. They allow your app to execute code when a notification is received, even if your app is not active.

Each target has an entitlement file. If there are multiple entitlements files per project, EAS will randomly pick one and apply it to both targets. To mitigate this, we have added the push capability entilement to both files (even though it's really only necessary in the main target). This can still pose a problem if it picks the NSE's entitlements file since it *could* break any other capabilities in your project, given that file will not have capabilities added to your main target by yourself or other plugins.

The following section details how to mitigate these issues and not break your other capabilities.

## Complex Setup

### 1. Credentials setup
To build successfully, you will need to create and use local credentials (one for production and development). Add `"credentialsSource": "local"` to your `eas.json` file.

**Example:**
```json
{
  "build": {
    "release": {
      "android": {
        "gradleCommand": ":app:bundleRelease"
      },
      "ios": {
        "credentialsSource": "local",
        "buildConfiguration": "Release"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "credentialsSource": "local"
    }
  }
}
```

### 2. Identifiers
In your [Apple developer console](https://developer.apple.com) create two identifiers with the following format:
   - `<com.example.app>` <-- you likely already have this one
   - `<com.example.app>.OneSignalNotificationServiceExtension`

#### When modifying your existing main app identifier:
   - add the App Groups capability like so: `group.<identifier>.onesignal`
   - keep / add the "Push Notifications" capability

#### When creating a new identifier for `OneSignalNotificationServiceExtension`:
   - select AppId from the list of identifier types
   - select App when choosing between App and App Clip
   - add the App Groups capability like so: `group.<identifier>.onesignal`
   - do not add the "Push Notifications" capability

#### Note on App Groups at Build Time:
Make sure to build with both identifiers containing the AppGroup simultaneously. To troubleshoot, remove them both and then rebuild with both identifiers' AppGroup capabilities enabled.

### 3. Provisioning
Create AdHoc (local development) and AppStore (production) provisioning profiles with both identifiers (four provisioning profiles total). Both provisioning profiles should use the same distribution certificate that is used by your app. Download the profiles.

### 4. Add the profiles to your `credentials.json` file:
Use the same distribution certificate for the `OneSignalNotificationServiceExtension` as is used for your app (no need to create a new cert).

We recommend creating a `certs` directory in your project with subdirectories for each build type (e.g: `certs/adhoc` & `certs/appstore`). Doing so, you can more easily switch which provisioning profiles get used at build time.

**Directory structure:**
```
/certs
   - /adhoc
   - /appstore
```

**Example `credentials.json`:**
```json
{
    "ios": {
        "<PROJECT>": {
            "distributionCertificate": {
                "path": "certs/ios_distribution_certificate.p12",
                "password": "***"
            },
            "provisioningProfilePath": "certs/adhoc/***mobileappprofile.mobileprovision"
        },
        "OneSignalNotificationServiceExtension": {
            "distributionCertificate": {
                "path": "certs/ios_distribution_certificate.p12",
                "password": "***"
            },
            "provisioningProfilePath": "certs/adhoc/***onesignalprofile.mobileprovision"
        }
    }
}
```

**Note:** your push certificate (p12) file should not appear anywhere in the `credentials.json` file.

## Build (complex setup continued)

**IMPORTANT**: run the `eas build` command with `EXPO_NO_CAPABILITY_SYNC` if you want to prevent EAS from syncing capabilities (e.g: overwriting the steps you took in the complex setup).

### Release
If you are ready for a production build, you should use the AppStore provisioning profiles you created. Make sure your `credentials.json` file is using the correct profiles.

### Development
The development build will use the AdHoc provisioning profiles you created. Make sure your `credentials.json` file is using the correct profiles.

---
</details>

### Expo development client
If you haven't already, add the expo development client to your project:

```sh
expo install expo-dev-client
```

Make sure `"developmentClient": true,` is set in your `eas.json` development build profile.

### Run the EAS build command
```sh
eas build --profile <build profile> --platform ios
```
where `<build profile>` refers to the build profile in your `eas.json` file (e.g: "development" vs "release").

### Build success
At this point, your build should succeed. You can check its progress by opening the build link in the terminal.

## How to run on your device
See our [EAS guide](EAS.md) for instructions.