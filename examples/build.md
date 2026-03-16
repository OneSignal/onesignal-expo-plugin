# OneSignal Expo Sample App - Build Guide

This document extends the shared build guide with Expo-specific details.

**Read the shared guide first:**
https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/demo/build.md

Replace `{{PLATFORM}}` with `Expo` everywhere in that guide. Everything below either overrides or supplements sections from the shared guide.

---

## Project Foundation

Create a new Expo project at `examples/demo/` using the TypeScript template:

```
npx create-expo-app@latest examples/demo --template
```

Use the Blank (TypeScript) template. Do not use Expo Router.
If the generated project contains Expo Router scaffold, remove it:

```
rm -rf examples/demo/app
```

Keep `examples/demo/App.tsx` as the only app entry file.

Platform specifics:

- React Context + useReducer for state management
- TypeScript with strict mode enabled
- App bar text: "Expo" (next to the OneSignal logo SVG)
- Support for both Android and iOS

### SVG Logo

Save the logo SVG to `assets/onesignal_logo.svg` and import it as a component:

```typescript
import OneSignalLogo from './assets/onesignal_logo.svg'
<OneSignalLogo width={99} height={22} />
```

Do not inline SVG path strings in App.tsx.

### App Icons

```
rm -f examples/demo/assets/images/*
curl -L "https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo_icon_padded.png" \
  -o "examples/demo/assets/images/icon.png"
```

In `app.json`:

```json
"icon": "./assets/images/icon.png"
```

Reuse the same image for splash:

```json
["expo-splash-screen", { "image": "./assets/images/icon.png" }]
```

Omit the "web" block and do not create `favicon.png`.
Remove any `android.adaptiveIcon` image entries from `app.json`.

### OneSignal Plugin + Config

Install the local Expo plugin from a packed tarball (Bun does not reliably handle `file:../../` folder deps):

```json
"onesignal-expo-plugin": "file:../../onesignal-expo-plugin.tgz"
```

Install the OneSignal runtime SDK from npm:

```json
"react-native-onesignal": "<latest compatible version>"
```

Configure `app.json` with the plugin as the FIRST entry:

```json
"plugins": [
  ["onesignal-expo-plugin", { "mode": "development" }]
]
```

Do not include "expo-router" in the plugins list.

Set OneSignal App ID:

```json
"extra": {
  "oneSignalAppId": "b79087eb-8531-4d2d-a6f5-726f797891c7"
}
```

### Prebuild & Run

```
npx expo prebuild
npx expo run:android
npx expo run:ios
```

A `setup.sh` script in `examples/` handles building, packing, and installing automatically.
Add these scripts to `package.json`:

```json
"setup": "../setup.sh",
"preandroid": "bun run setup",
"preios": "bun run setup",
```

Before first run: `bun run setup`
Then use: `bun run android` / `bun run ios`

---

## Dependencies

dependencies:

- expo: ~54.x
- react-native: 0.81.x
- react-native-onesignal: latest
- onesignal-expo-plugin: file:../../onesignal-expo-plugin.tgz
- @react-native-async-storage/async-storage: ^2.1.0
- react-native-svg: ^15.8.0
- @expo/vector-icons: ^15.0.0
- @react-navigation/native: ^6.1.0
- @react-navigation/native-stack: ^6.11.0
- react-native-screens: Expo-compatible version
- react-native-safe-area-context: Expo-compatible version
- react-native-gesture-handler: Expo-compatible version
- react-native-reanimated: Expo-compatible version
- react-native-toast-message: ^2.2.0

devDependencies:

- react-native-svg-transformer: ^1.5.3
- @typescript-eslint/eslint-plugin: ^7.0.0
- @typescript-eslint/parser: ^7.0.0
- eslint: ^8.57.0

Install with Expo to avoid version drift:

```
npx expo install react-native-onesignal @react-native-async-storage/async-storage react-native-svg @expo/vector-icons @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-toast-message
```

### Metro SVG Config

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.transformer.babelTransformerPath =
  require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg',
);
config.resolver.sourceExts.push('svg');
module.exports = config;
```

### TypeScript SVG Declaration

```typescript
// types/svg.d.ts
declare module '*.svg' {
  import type { FunctionComponent } from 'react';
  import type { SvgProps } from 'react-native-svg';
  const content: FunctionComponent<SvgProps>;
  export default content;
}
```

No manual Podfile or `android/app/build.gradle` edits needed. Expo prebuild + config plugins manage native wiring. If native folders exist and deps/plugins changed: `npx expo prebuild --clean`

---

## Reuse and Port the RN Demo

You MUST use the OneSignal React Native demo as the implementation base and port it into this Expo project. Do NOT rebuild from scratch.

Source: https://github.com/OneSignal/react-native-onesignal/tree/main/examples/demo

Copy set (minimal edits):

- `src/models/*`
- `src/services/*`
- `src/repositories/*`
- `src/context/*`
- `src/components/*` and `src/components/modals/*`
- `src/components/sections/*`
- `src/screens/*`

### Required Expo Adaptations

1. **App entry**: Keep single root `App.tsx`. Initialize OneSignal with app ID from Expo config (`extra.oneSignalAppId`) or local state.

2. **Config plugin**: `onesignal-expo-plugin` must be the first plugin in `app.json`. Run `npx expo prebuild` after config changes.

3. **Icons**: Replace `react-native-vector-icons` imports with `@expo/vector-icons` exports. Keep icon names and behavior the same.

4. **Navigation**: Keep React Navigation stack behavior identical to the RN demo.

5. **Native folders**: No manual Podfile/Gradle edits. Let Expo prebuild regenerate native code.

### Execution Order

1. Copy models/services/repository/context
2. Copy components + modals
3. Copy section components + screens
4. Integrate root app bootstrap and navigation
5. Adapt icons/imports and path aliases
6. Prebuild and run on Android/iOS

### Completion Gate

- App starts without runtime import errors
- OneSignal initialize/login/logout/observers work
- Push permission prompt + toggle behavior match expected UX
- IAM, tags, aliases, email, SMS, outcomes, triggers flows work
- Tooltips load from remote URL
- Toasts and LogView behave as expected

---

## Expo-Specific SDK Initialization

In `App.tsx`, initialize before rendering:

```typescript
import Constants from 'expo-constants';

const appId = Constants.expoConfig?.extra?.oneSignalAppId ?? '';

OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(cachedConsentRequired);
OneSignal.setConsentGiven(cachedPrivacyConsent);
OneSignal.initialize(appId);
```

After initialize, restore cached SDK states from AsyncStorage:

```typescript
OneSignal.InAppMessages.setPaused(cachedPausedStatus);
OneSignal.Location.setShared(cachedLocationShared);
```

Register listeners using `addEventListener` / `removeEventListener`:

```typescript
OneSignal.InAppMessages.addEventListener('willDisplay', handler);
OneSignal.User.pushSubscription.addEventListener('change', handler);
OneSignal.Notifications.addEventListener('permissionChange', handler);
OneSignal.User.addEventListener('change', handler);
```

Always remove listeners in `useEffect` cleanup.

---

## Expo-Specific Component Notes

### Toast Messages

Use `react-native-toast-message`:

```typescript
<Toast position="bottom" bottomOffset={20} />
```

Place `<Toast />` at the root of `App.tsx` (outside NavigationContainer children).

### Icons

Use `@expo/vector-icons` (MaterialCommunityIcons / MaterialIcons) for all icons. IAM send buttons use:

- TOP BANNER: `arrow-up-bold-box-outline`
- BOTTOM BANNER: `arrow-down-bold-box-outline`
- CENTER MODAL: `crop-square`
- FULL SCREEN: `fullscreen`

### Accessibility / Appium

Use the `testID` prop on all interactive elements for Appium test automation.

### LogView

- Sticky at top of screen, single horizontal ScrollView on the entire log list
- Use `onLayout` + `minWidth` so content is at least screen-wide
- Vertical ScrollView + mapped entries (not FlatList)
- Trash icon via `@expo/vector-icons` delete icon
- Auto-scroll to newest via `scrollToEnd` on ScrollView ref

### Theme

Implement `AppTheme` mapping `styles.md` to `StyleSheet.create`, text style objects, and shared shadow/elevation styles for iOS/Android. Export `AppColors` and `AppSpacing` convenience constants.

---

## Key Files Structure

```
examples/demo/
├── app.json
├── App.tsx
├── metro.config.js
├── tsconfig.json
├── package.json
├── types/
│   └── svg.d.ts
└── src/
    ├── theme.ts
    ├── models/
    │   ├── UserData.ts
    │   ├── NotificationType.ts
    │   └── InAppMessageType.ts
    ├── services/
    │   ├── OneSignalApiService.ts
    │   ├── PreferencesService.ts
    │   ├── TooltipHelper.ts
    │   └── LogManager.ts
    ├── repositories/
    │   └── OneSignalRepository.ts
    ├── context/
    │   └── AppContext.tsx
    ├── screens/
    │   ├── HomeScreen.tsx
    │   └── SecondaryScreen.tsx
    └── components/
        ├── SectionCard.tsx
        ├── ToggleRow.tsx
        ├── ActionButton.tsx
        ├── ListWidgets.tsx
        ├── LoadingOverlay.tsx
        ├── LogView.tsx
        ├── modals/
        │   ├── SingleInputModal.tsx
        │   ├── PairInputModal.tsx
        │   ├── MultiPairInputModal.tsx
        │   ├── MultiSelectRemoveModal.tsx
        │   ├── LoginModal.tsx
        │   ├── OutcomeModal.tsx
        │   ├── TrackEventModal.tsx
        │   ├── CustomNotificationModal.tsx
        │   └── TooltipModal.tsx
        └── sections/
            ├── AppSection.tsx
            ├── PushSection.tsx
            ├── SendPushSection.tsx
            ├── InAppSection.tsx
            ├── SendIamSection.tsx
            ├── AliasesSection.tsx
            ├── EmailsSection.tsx
            ├── SmsSection.tsx
            ├── TagsSection.tsx
            ├── OutcomesSection.tsx
            ├── TriggersSection.tsx
            ├── TrackEventSection.tsx
            └── LocationSection.tsx
```

Native `ios` and `android` folders are generated by `npx expo prebuild`.

---

## Configuration

In `app.json`:

```json
{
  "expo": {
    "extra": {
      "oneSignalAppId": "b79087eb-8531-4d2d-a6f5-726f797891c7"
    },
    "android": {
      "package": "com.onesignal.example"
    },
    "ios": {
      "bundleIdentifier": "com.onesignal.example"
    }
  }
}
```

Identifiers MUST be `com.onesignal.example` to match existing `google-services.json` and `agconnect-services.json`.

REST API key is NOT required for the fetchUser endpoint.
