# OneSignal + expo-notifications Example

This Expo app is a focused repro harness for testing OneSignal alongside `expo-notifications`, especially the notification response listener conflict discussed in [GitHub issue #177](https://github.com/OneSignal/onesignal-expo-plugin/issues/177).

The app registers `expo-notifications` listeners before initializing OneSignal, then logs events from both libraries:

- `Notifications.addNotificationReceivedListener`
- `Notifications.addNotificationResponseReceivedListener`
- `Notifications.getLastNotificationResponseAsync`
- `OneSignal.Notifications.addEventListener('click', ...)`

## Setup

Copy `.env.example` to `.env` and set your OneSignal app ID:

```sh
cp .env.example .env
```

```sh
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
```

Install dependencies from this directory:

```sh
vp install
```

## Run

Use a development build on a physical device for push notification testing:

```sh
vp run ios
vp run android
```

## Test Flow

1. Tap **Request Permissions**.
2. Tap **Schedule Expo Local Notification**, background the app if needed, then tap the local notification. The event log should show `Expo response`.
3. Wait for a OneSignal push ID, then tap **Send OneSignal Push** and tap the push notification. Compare whether the event log shows `OneSignal click`, `Expo response`, or both.

## Native Configuration

`app.config.ts` enables:

- `expo-notifications` before `onesignal-expo-plugin` in the plugin list
- OneSignal development mode
- `com.onesignal.exponotif` as the iOS bundle ID and Android package
- iOS remote-notification background mode and development push entitlement
