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
2. Tap **Schedule Expo Local Notification**, background the app if needed, then tap the local notification. The event log should show `Expo response`. If the tap starts the app from a closed state, the log shows `Expo last response` instead.
3. Wait for a OneSignal push ID, then tap **Send OneSignal Push** and tap the push notification. Compare whether the event log shows `OneSignal click`, `Expo response`, or both.

## Native Configuration

`app.config.ts` enables:

- `expo-notifications` before `onesignal-expo-plugin` in the plugin list
- OneSignal development mode
- `com.onesignal.example` as the iOS bundle ID and Android package
- iOS remote-notification background mode and development push entitlement

### iOS compatibility workaround

OneSignal sets a placeholder `UNUserNotificationCenter` delegate when the app
binary loads. `expo-notifications` then finds an existing delegate and does not
register, so its listeners do not receive non-OneSignal notifications.

The local Expo module in `modules/expo-notifications-delegate` fixes this. Its
app delegate subscriber sets Expo's `NotificationCenterManager` as the delegate
during launch. OneSignal wraps that delegate, handles its own notifications, and
forwards all other notifications to Expo. Expo autolinks the module, so
`AppDelegate.swift` needs no change. To use the workaround in your app, copy the
`modules/expo-notifications-delegate` directory into your project. Then run
`expo prebuild --clean`. The app must use a development build with
`expo-notifications` installed.

Expo still logs `NotificationCenterManager encountered already present delegate`
at launch. The module replaces the delegate after that log, so the warning does
not mean that the workaround failed.

`plugins/withExpoNotificationsDelegate.js` is an alternative config plugin that
patches the generated `AppDelegate.swift` during prebuild. It finds its
insertion points by exact text, so a change to the Expo template can break it.
To use it, delete `modules/expo-notifications-delegate`. Then wrap the config
in `app.config.ts` with the plugin. Use only one of the two options.

Both options give the same behavior:

- OneSignal handles each notification event first and then forwards it to
  Expo. So Expo listeners also receive OneSignal pushes.
- For a OneSignal push, `content.data` is empty in Expo. Expo reads that field
  from a `body` key, and OneSignal pushes do not have one. To identify a
  OneSignal push on iOS, check `request.trigger.payload.custom.i`.
- OneSignal decides how its own pushes show in the foreground. Expo's
  `setNotificationHandler` result does not apply to them.
- Both options need OneSignal method swizzling. Do not set
  `OneSignal_disable_swizzling` in `Info.plist`.

We tested both options on an iPhone 17 Pro simulator with iOS 26.5, Expo
54.0.35, `expo-notifications` 0.32.17, and `react-native-onesignal` 5.5.1
(OneSignal iOS SDK 5.5.2). The tests covered local notifications in the
foreground, after a background tap, and after a cold-start tap. They also
covered a OneSignal push in the foreground, after a background tap, and after a
cold-start tap.

Both options are workarounds, not a guaranteed compatibility contract between
the two SDKs. Test again after you upgrade `expo-notifications` or OneSignal.
Keep the generated `ios` directory ignored. Run `vp run clean` to regenerate
it.

In the future, we want the OneSignal SDK to support local notifications
directly so apps do not need to install another notification plugin with
overlapping responsibilities.
