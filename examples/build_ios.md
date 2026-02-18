# iOS build setup for push notifications

To test OneSignal push notifications in the Expo demo on iOS, make sure the `ios` block in `examples/demo/app.json` matches the current config:

```json
{
  "expo": {
    "ios": {
      "icon": "./assets/images/icon.png",
      "bundleIdentifier": "com.onesignal.example",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      },
      "entitlements": {
        "aps-environment": "development",
        "com.apple.security.application-groups": [
          "group.${ios.bundleIdentifier}.onesignal"
        ]
      },
      "supportsTablet": true
    }
  }
}
```

If your `ios` block already exists, only add or update the keys shown above.
