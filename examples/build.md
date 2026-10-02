# OneSignal Expo Sample App - Build Guide

This document extends the shared build guide with Expo-specific details.

**Read the shared guide first:**
https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/demo/build.md

Replace `{{PLATFORM}}` with `Expo` everywhere in that guide. Everything below either overrides or supplements sections from the shared guide.

> Note: the sibling doc `examples/build_ios.md` is stale -- it still references `app.json` and a different app-group pattern. Prefer this `examples/build.md` as the source of truth and cross-reference it.

---

## Project Foundation

Create a new Expo project at `examples/demo/` using the TypeScript template:

```
npx create-expo-app@latest examples/demo --template
```

Use the Blank (TypeScript) template.

The demo uses Expo Router file-based routing. `package.json` `main` is `expo-router/entry`, and routes live in `app/`:

- `app/_layout.tsx` -- root layout: `SafeAreaProvider` + `ToastProvider` + `OneSignalProvider` wrapping the Expo Router `Stack`, with `AppHeader` as the custom header.
- `app/index.tsx` -- re-exports `src/screens/HomeScreen`.
- `app/secondary.tsx` -- re-exports `src/screens/SecondaryScreen`.

Do not import from `@react-navigation/*` directly (SDK 56+). Use `expo-router` APIs (`Stack`, `useRouter`, `NativeStackHeaderProps`).

Platform specifics:

- State managed by a single `OneSignalProvider` exposed via `useOneSignal()` (`src/hooks/useOneSignal.ts`) -- no Context+reducer, no repository class.
- TypeScript with strict mode enabled.
- App bar text: "Expo" (next to the OneSignal logo SVG) -- rendered by `src/components/AppHeader.tsx`.
- Support for both Android and iOS.
- `packageManager: bun@<version>` is pinned in `package.json`.
- The `vp` toolchain drives setup (`vp run setup`, `vp add`) -- see `examples/setup.sh`.

### SVG Logo

Save the logo SVG to `assets/onesignal_logo.svg` and import it as a component:

```typescript
import OneSignalLogo from './assets/onesignal_logo.svg'
<OneSignalLogo width={99} height={22} />
```

Do not inline SVG path strings in `app/_layout.tsx`.

### App Icons

```
rm -f examples/demo/assets/images/*
curl -L "https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo_icon_padded.png" \
  -o "examples/demo/assets/images/icon.png"
```

In `app.config.ts`:

```ts
icon: './assets/images/icon.png',
```

Reuse the same image for splash via the `expo-splash-screen` plugin entry (see Dependencies).

Omit the "web" block and do not create `favicon.png`.
Remove any `android.adaptiveIcon` image entries from `app.config.ts`.

A separate `assets/images/small_icon.png` ships the Android status-bar icon; it's wired through the OneSignal plugin's `smallIcons` option.

### OneSignal Plugin + Config

Install the local Expo plugin from a packed tarball (Bun does not reliably handle `file:../../` folder deps):

```json
"onesignal-expo-plugin": "file:../../onesignal-expo-plugin.tgz"
```

Install the OneSignal runtime SDK from npm, pinned:

```json
"react-native-onesignal": "5.4.3"
```

Configure `app.config.ts` with the plugin as the FIRST entry, using the full options shape that the demo ships:

```ts
plugins: [
  [
    'onesignal-expo-plugin',
    {
      mode: 'development',
      appGroupName: 'group.com.onesignal.example.onesignal',
      nseBundleIdentifier: 'NSE',
      smallIcons: ['./assets/images/small_icon.png'],
      smallIconAccentColor: '#C0FFEE',
      largeIcons: ['./assets/images/icon.png'],
      sounds: ['./assets/vine_boom.wav'],
      // iosNSEFilePath: './customNSE/NSE.m', // opt-in Obj-C NSE
      liveActivities: {
        targetName: 'OneSignalWidget',
        bundleIdentifierSuffix: 'LA',
        widgetFilePath: './customWidget/LiveActivity.swift',
      },
    },
  ],
  'expo-router',
  [
    'expo-splash-screen',
    { image: './assets/images/icon.png', imageWidth: 200, resizeMode: 'contain', backgroundColor: '#ffffff' },
  ],
],
```

Set the OneSignal App ID via the env-var workflow, not `extra.oneSignalAppId` -- see "Environment variables" below.

### Prebuild & Run

```
npx expo prebuild
npx expo run:android --device
npx expo run:ios --device
```

A `setup.sh` script in `examples/` handles building, packing, and installing the plugin tarball automatically; it is driven through `vp run setup` / `vp add`.

`package.json` scripts:

```json
"setup": "../setup.sh",
"preandroid": "vp run setup",
"preios": "vp run setup",
"android": "expo run:android --device",
"ios": "expo run:ios --device"
```

Before first run: `vp run setup`
Then use: `bun run android` / `bun run ios`

### Environment variables

The demo uses Expo's `EXPO_PUBLIC_` env prefix; values are inlined into the JS bundle at build time. `.env` is gitignored; `.env.example` is committed.

- `EXPO_PUBLIC_ONESIGNAL_APP_ID` -- read by `src/hooks/useOneSignal.ts`. Hardcoded fallback: `77e32082-ea27-42e3-a898-c72e141824ef`.
- `EXPO_PUBLIC_ONESIGNAL_API_KEY` -- required for Live Activity REST update/end calls in `OneSignalApiService`.
- `EXPO_PUBLIC_ONESIGNAL_ANDROID_CHANNEL_ID` -- optional Android Notification Channel ID for the WITH-SOUND test notification.

---

## Dependencies

dependencies:

- expo: ~58.x
- react-native: 0.88.x
- react-native-onesignal: 5.5.9 (pinned)
- onesignal-expo-plugin: file:../../onesignal-expo-plugin.tgz
- @react-native-async-storage/async-storage: 2.2.0
- react-native-svg: Expo-compatible version
- @expo/vector-icons: ^15.0.0
- react-native-screens: Expo-compatible version
- react-native-safe-area-context: Expo-compatible version
- react-native-toast-message: ^2.3.3
- expo-router: ~58.x (routing; also registered in `app.config.ts` `plugins`)
- expo-constants, expo-linking, expo-font: Expo-compatible versions (required peers of `expo-router` / `@expo/vector-icons`)
- expo-splash-screen: ~58.x (also registered in `app.config.ts` `plugins`)

`react-native-gesture-handler` and `react-native-reanimated` are not direct deps -- they come in transitively via `expo-router`.

devDependencies:

- react-native-svg-transformer: ^1.5.3
- @types/react: ~19.3.x
- typescript: ~6.0.x

No ESLint config in the repo.

Install with Expo to avoid version drift:

```
npx expo install react-native-onesignal @react-native-async-storage/async-storage react-native-svg @expo/vector-icons react-native-screens react-native-safe-area-context react-native-toast-message expo-router expo-constants expo-linking expo-font expo-splash-screen
```

### Metro SVG Config

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
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

You MUST use the OneSignal React Native demo as the implementation base. Do NOT rebuild from scratch -- but expect significant divergence in the Expo port.

Source: https://github.com/OneSignal/react-native-onesignal/tree/main/examples/demo

Dropped from the RN demo:

- `LogManager` service
- `LoadingOverlay` component
- `LogView` component
- `OneSignalRepository`
- `AppContext` (Context + reducer layer)
- `LoginModal` (replaced by `SingleInputModal` inside `UserSection`)
- `TrackEventSection` (folded into `CustomEventsSection`)

Replaced with:

- `src/hooks/useOneSignal.ts` -- `OneSignalProvider` + `useOneSignal()` hook holding all SDK state.
- Inline `LoadingState` rendered directly inside list sections (no overlay).

Added (Expo-specific):

- `src/components/sections/UserSection.tsx`
- `src/components/sections/CustomEventsSection.tsx`
- `src/components/sections/LiveActivitySection.tsx`
- `src/components/AppHeader.tsx`
- `src/components/ToastProvider.tsx`
- Env-var workflow (`.env`, `.env.example`, `EXPO_PUBLIC_*`).
- Plugin config: live activities, NSE, custom small/large icons and sounds.

### Required Expo Adaptations

1. **App entry**: `expo-router/entry` with the root layout in `app/_layout.tsx`. SDK initialize happens inside `OneSignalProvider`, not in the layout.
2. **Config plugin**: `onesignal-expo-plugin` must be the first plugin in `app.config.ts`. Run `npx expo prebuild` after config changes.
3. **Icons**: Replace `react-native-vector-icons` imports with `@expo/vector-icons` exports. Only `MaterialIcons` is used in the demo.
4. **Navigation**: Keep stack behavior identical to the RN demo using the Expo Router `Stack` (`router.push('/secondary')`, `router.back()`).
5. **Native folders**: No manual Podfile/Gradle edits. Let Expo prebuild regenerate native code -- with the exception of `ios/OneSignalWidget` (see "Native folder gitignore").

### Execution Order

1. Port models/services (drop `LogManager`).
2. Wire `OneSignalProvider` / `useOneSignal()` and remove the repository/context layer.
3. Port section components + screens; replace `LoginModal` use with `SingleInputModal` inside `UserSection`.
4. Integrate root app bootstrap and navigation; wrap with `ToastProvider` + `OneSignalProvider`.
5. Adapt icons/imports and path aliases.
6. Add env-var workflow and plugin config (live activities, NSE, icons, sounds).
7. Prebuild and run on Android/iOS.

### Completion Gate

- App starts without runtime import errors
- OneSignal initialize/login/logout/observers work
- Push permission prompt + toggle behavior match expected UX
- IAM, tags, aliases, email, SMS, outcomes, triggers flows work
- Tooltips load from remote URL
- Toasts behave as expected

---

## State Management / Expo-Specific SDK Initialization

State lives in a single `OneSignalProvider` exposed via `useOneSignal()` (`src/hooks/useOneSignal.ts`). No Context+reducer, no repository class.

SDK init runs inside `OneSignalProvider` / `useOneSignalState()`, NOT in `app/_layout.tsx`. The layout only sets up the `Stack` and the `OneSignalProvider` + `ToastProvider` wrappers.

App ID is resolved in `useOneSignal.ts` via `process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID` with hardcoded fallback `77e32082-ea27-42e3-a898-c72e141824ef`. No `expo-constants` lookup, no `extra.oneSignalAppId`.

```typescript
const DEFAULT_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';
const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID?.trim() || DEFAULT_APP_ID;

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

`ToastProvider` (`src/components/ToastProvider.tsx`) is rendered in `app/_layout.tsx`, wrapping `OneSignalProvider` + the Expo Router `Stack`. It owns the lone `<Toast position="bottom" bottomOffset={20} />` host.

- Exports `useSnackbar()`; section components call `const showSnackbar = useSnackbar()` and invoke it from the allowed action handlers (Outcomes, Custom Events, Location check).
- Replace-on-show via `Toast.hide()` before `Toast.show({ type: 'info', text1: message, visibilityTime: TOAST_DURATION_MS })`.
- Uses the module-level constant `TOAST_DURATION_MS = 3000`.

Do not introduce a second `<Toast />` host, do not call `Toast.show(...)` directly from sections, and do not hold toast state in the SDK hook.

### Dialogs

The home screen owns layout + `TooltipModal` only; sections own their action dialogs via local `useState` booleans and render modals from `src/components/modals/`. Login uses `SingleInputModal` inside `UserSection.tsx` (there is no dedicated `LoginModal`).

### Icons

Use `@expo/vector-icons` (`MaterialIcons` only) for all icons.

### Accessibility / Appium

Use the `testID` prop on all interactive elements for Appium test automation.

### Logging

Logging uses `console.log` in `useOneSignal.ts`; no in-app log viewer.

### Theme

Implement `AppTheme` mapping `styles.md` to `StyleSheet.create`, text style objects, and shared shadow/elevation styles for iOS/Android. Export `AppColors` and `AppSpacing` convenience constants.

### Live Activities (iOS only)

- `LiveActivitySection` is rendered in `HomeScreen`, iOS-only gated.
- `customWidget/LiveActivity.swift` is hand-authored Swift paired with the plugin `liveActivities` config (see `app.config.ts`).
- REST update / end is performed by `OneSignalApiService` using `EXPO_PUBLIC_ONESIGNAL_API_KEY`.

### Native folder gitignore

`.gitignore` treats most of `ios/` and `android/` as generated by `expo prebuild`. It tracks the `ios/OneSignalWidget` exception so the Live Activity target's hand-authored files are not blown away.

### Expo experiments / new architecture

`app.config.ts` sets `experiments: { typedRoutes: true, reactCompiler: true }`. The New Architecture is always on (SDK 58 removed `newArchEnabled` from `ExpoConfig`).

---

## Key Files Structure

```
examples/demo/
├── .env
├── .env.example
├── app.config.ts
├── metro.config.js
├── tsconfig.json
├── package.json
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── secondary.tsx
├── assets/
│   ├── onesignal_logo.svg
│   ├── vine_boom.wav
│   └── images/
│       ├── icon.png
│       └── small_icon.png
├── customNSE/
│   └── NSE.m
├── customWidget/
│   └── LiveActivity.swift
├── types/
│   └── svg.d.ts
└── src/
    ├── theme.ts
    ├── hooks/
    │   └── useOneSignal.ts
    ├── models/
    │   ├── UserData.ts
    │   ├── NotificationType.ts
    │   └── InAppMessageType.ts
    ├── services/
    │   ├── OneSignalApiService.ts
    │   ├── PreferencesService.ts
    │   └── TooltipHelper.ts
    ├── screens/
    │   ├── HomeScreen.tsx
    │   └── SecondaryScreen.tsx
    └── components/
        ├── AppHeader.tsx
        ├── SectionCard.tsx
        ├── ToggleRow.tsx
        ├── ActionButton.tsx
        ├── ListWidgets.tsx
        ├── ToastProvider.tsx
        ├── modals/
        │   ├── SingleInputModal.tsx
        │   ├── PairInputModal.tsx
        │   ├── MultiPairInputModal.tsx
        │   ├── MultiSelectRemoveModal.tsx
        │   ├── OutcomeModal.tsx
        │   ├── TrackEventModal.tsx
        │   ├── CustomNotificationModal.tsx
        │   └── TooltipModal.tsx
        └── sections/
            ├── AppSection.tsx
            ├── UserSection.tsx
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
            ├── CustomEventsSection.tsx
            ├── LiveActivitySection.tsx
            └── LocationSection.tsx
```

Native `ios` and `android` folders are generated by `npx expo prebuild`, except for `ios/OneSignalWidget` which is tracked.

---

## Configuration

In `app.config.ts`:

```ts
{
  name: 'OneSignal Demo',
  slug: 'demo',
  icon: './assets/images/icon.png',
  scheme: 'demo',
  ios: {
    appleTeamId: '99SW8E36CT',
    icon: './assets/images/icon.png',
    bundleIdentifier: 'com.onesignal.example',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
      NSLocationWhenInUseUsageDescription: 'This app uses your location to...',
      NSSupportsLiveActivities: true,
    },
    entitlements: {
      'aps-environment': 'development',
      // Placeholder app group; the actual OneSignal app group is supplied
      // through the plugin's `appGroupName` option below.
      'com.apple.security.application-groups': ['group.expoNotUsed'],
    },
    supportsTablet: true,
  },
  android: {
    package: 'com.onesignal.example',
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
  },
  experiments: { typedRoutes: true, reactCompiler: true },
}
```

The OneSignal plugin sets the real app group via `appGroupName: 'group.com.onesignal.example.onesignal'` (see "OneSignal Plugin + Config"). `group.expoNotUsed` is a placeholder slot in `entitlements.application-groups` for cases where you want to add additional app groups.

Identifiers must match whatever you wire up in Firebase / Huawei AGC manually. There are no `google-services.json` or `agconnect-services.json` files committed in `examples/demo/`.

REST API key is NOT required for the fetchUser endpoint, but `EXPO_PUBLIC_ONESIGNAL_API_KEY` IS required for Live Activity REST update/end calls.
