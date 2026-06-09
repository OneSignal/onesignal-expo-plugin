# OneSignal No-Location Expo Demo

Minimal Expo app for verifying OneSignal push without linking the native
location module.

## Why This Exists

Some apps use OneSignal for push notifications and in-app messages but do not use
`OneSignal.Location`. Linking the native location module can still make app
stores detect location APIs. On iOS, that can lead to App Store Connect warnings
such as `ITMS-90683` and may require location usage descriptions that the app
does not actually need.

This demo enables `disableLocation` in `app.config.ts` and runs native builds with
`ONESIGNAL_DISABLE_LOCATION=true` so the OneSignal location module is excluded.

## Run

```sh
vp run clean
vp run ios
vp run android
```

The `ios`, `android`, and `clean` scripts export
`ONESIGNAL_DISABLE_LOCATION=true` before native dependency resolution/builds.

## iOS

The generated Podfile sets `ENV['ONESIGNAL_DISABLE_LOCATION'] = 'true'`, so
CocoaPods resolves `react-native-onesignal` without the OneSignal location
subspec. The app config intentionally does not include location usage
descriptions.

## Android

Gradle reads `ONESIGNAL_DISABLE_LOCATION` from the build environment. If you build
Android another way (Android Studio, EAS, or a raw `./gradlew` invocation), set
`ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

The app config intentionally does not request fine or coarse location
permissions.
