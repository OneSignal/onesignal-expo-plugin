# iOS build setup for push notifications

To test OneSignal push notifications in the Expo demo on iOS, set a real iOS bundle identifier and enable remote notification background mode in `examples/demo/app.json`.

Use this value:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.onesignal.example",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      },
      "entitlements": {
        "aps-environment": "development",
        "com.apple.security.application-groups": [
          "group.${ios.bundleIdentifier}.onesignal"
        ]
      }
    }
  }
}
```

If your `ios` block already exists, only add or update `bundleIdentifier`, `infoPlist.UIBackgroundModes`, and `entitlements`.
