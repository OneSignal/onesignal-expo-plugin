# OneSignal Expo No-Location Demo

This is a small Expo app for testing `disableLocation: true` in the OneSignal Expo plugin. It initializes OneSignal, requests push permission, and avoids location features.

## Setup

The demo uses the shared OneSignal app `1154c350-e715-4b71-a58b-1b84b6745baa` by default. To use your own app, copy `.env.example` to `.env` and set `EXPO_PUBLIC_ONESIGNAL_APP_ID`:

```sh
cp .env.example .env
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
- `com.onesignal.example` as the iOS bundle ID and Android package, on team `99SW8E36CT`
- iOS remote-notification background mode and development push entitlement
- `onesignal.disableLocation=true` in the generated Android Gradle properties
