# OneSignal Expo No-Location Demo

This is a small Expo app for testing `disableLocation: true` in the OneSignal Expo plugin. It initializes OneSignal, requests push permission, and avoids location features.

## Setup

Copy `.env.example` to `.env` and set your OneSignal app ID:

```sh
cp .env.example .env
```

```sh
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
```

## Run

```sh
vp run ios
vp run android
```

The OneSignal Expo plugin configures native dependency resolution so the app builds without the OneSignal location module.

## Native Configuration

`app.config.ts` enables:

- `disableLocation: true` for the OneSignal plugin
- `com.onesignal.example` as the iOS bundle ID and Android package
- iOS remote-notification background mode and development push entitlement
- `onesignal.disableLocation=true` in the generated Android Gradle properties
