# OneSignal + expo-notifications Example

This Expo app demonstrates OneSignal remote notifications alongside local notifications scheduled and handled by `expo-notifications`. It works around the iOS notification response listener conflict discussed in [GitHub issue #177](https://github.com/OneSignal/onesignal-expo-plugin/issues/177) without changing either SDK.

The app logs events from both libraries:

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

## iOS Compatibility Workaround

Both libraries use `UNUserNotificationCenter.delegate`. OneSignal installs a delegate before Expo's app delegate subscriber starts, while Expo declines to replace an existing delegate. Registering JavaScript listeners before `OneSignal.initialize` is therefore too late.

The example-only config plugin at `plugins/withExpoNotificationsCompatibility.js` updates the generated Swift `AppDelegate` to assign `NotificationCenterManager.shared` before React Native starts. OneSignal's existing delegate swizzling then forwards callbacks through Expo's notification manager, allowing Expo local-notification response listeners and OneSignal listeners to coexist.

Run `vp run clean` after adding or changing the plugin so Expo regenerates the native project.

## Native Configuration

`app.config.ts` enables:

- `expo-notifications`
- the example-only iOS compatibility plugin
- OneSignal development mode
- `com.onesignal.example` as the iOS bundle ID and Android package
- iOS remote-notification background mode and development push entitlement
