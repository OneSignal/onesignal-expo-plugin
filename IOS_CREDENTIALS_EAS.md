# iOS Credentials Guide: OneSignal + EAS
## Overview
To distribute your iOS application, you must set up all the credentials required by Apple. The 3 primary iOS credentials are:
* Distribution certificate
* Provisioning profiles
* Push notification certificate

If you are using EAS, you may be letting Expo handle all your credentials. This is fine for your distribution and provisioning credentials. However, the push notification certificate *must* be handled separately since you are using OneSignal.

As of 3/22/2022, OneSignal does not support p8 files and EAS does not support p12 files which results in a particlar issue when cloud building through EAS while using the Expo managed credentials service. Since the EAS CLI only prompts for p8 files at the time of writing, the only way to complete the cloud build is to input "n" (no) when prompted for setting up push notifications through the CLI. However, this leads to the identifier not having the push capability required to set up push successfully. Until EAS adds more granular control over credentials or OneSignal adds p8 support or Expo adds p12 support, developers will have no option except to use local credentials only.

If you have developed on iOS before, you may be used to XCode helping with syncing things like capabilities across app targets. In Expo/EAS, we are likely not using XCode at all. Thus, we need to make sure that we set up everything manually via the Apple Developers portal.

### TLDR
To set up push notifications with OneSignal + Expo, you *must* manage all credentials yourself and use local credentials when cloud building through EAS.

---

# Setup

## 1. Credentials setup
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
  },
  "cli": {
    "version": ">= 0.40.0"
  }
}
```

## 2. Identifiers
In your [Apple developer console](https://developer.apple.com) create two identifiers with the following format:
   - `com.example.app` <-- you likely already have this one
   - `com.example.app.OneSignalNotificationServiceExtension`

### When modifying your existing main app identifier:
   - add the App Groups capability like so: `group.<identifier>.onesignal`
   - keep / add the "Push Notifications" capability

### When creating a new identifier for `OneSignalNotificationServiceExtension`:
   - select AppId from the list of identifier types
   - select App when choosing between App and App Clip
   - add the App Groups capability like so: `group.<identifier>.onesignal`
   - do not add the "Push Notifications" capability

#### Note on App Groups at Build Time:
Make sure to build with both identifiers containing the AppGroup simultaneously. To troubleshoot, remove them both and then rebuild with both identifiers' AppGroup capabilities enabled.

## 3. Provisioning
Create AdHoc (local development) and AppStore (production) provisioning profiles with both identifiers (four provisioning profiles total). Both provisioning profiles should use the same distribution certificate that is used by your app. Download the profiles.

## 4. Add the profiles to your `credentials.json` file:
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

---

# Build
### Release
If you are ready for a production build, you should use the AppStore provisioning profiles you created. Make sure your `credentials.json` file is using the correct profiles.

### Development
The development build will use the AdHoc provisioning profiles you created. Make sure your `credentials.json` file is using the correct profiles.

#### Expo development client
If you haven't already, add the expo development client to your project:

```sh
expo install expo-dev-client
```

Make sure `"developmentClient": true,` is set in your `eas.json` development build profile.

## All Builds

### Run the EAS build command
```sh
eas build --profile <build profile> --platform ios
```
where `<build profile>` refers to the build profile in your `eas.json` file (e.g: "development" vs "release").

### Build success
At this point, your build should succeed. You can check its progress by opening the build link in the terminal.

---

# How to run on your device
See our [EAS guide](EAS.md) for instructions.