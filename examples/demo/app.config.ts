import * as fs from 'node:fs';
import * as path from 'node:path';

import { ConfigContext, ExpoConfig } from '@expo/config';
import type { ConfigPlugin } from '@expo/config-plugins';
import { withDangerousMod, withGradleProperties } from '@expo/config-plugins';
import type { OneSignalPluginProps } from 'onesignal-expo-plugin';

// Inline mirror of `@expo/config-plugins`'s `PropertiesItem` discriminated
// union — re-declared here because the type lives at a deep import path
// (`@expo/config-plugins/build/utils/Properties`) that isn't part of the
// package's public type exports.
type GradlePropertiesItem =
  | { type: 'comment'; value: string }
  | { type: 'empty' }
  | { type: 'property'; key: string; value: string };

// Tweaks `android/gradle.properties` for faster local builds. Defined inline
// (rather than `./plugins/...`) because @expo/config evaluates app.config.ts
// through a TS transform applied only to this file — a relative `import`
// from here resolves through Node's CJS resolver, which doesn't try `.ts`.
const FAST_BUILD_PROPERTIES: Record<string, string> = {
  // Reuse compiled outputs (CMake, Kotlin, Java, dex) across builds.
  // Single biggest win for repeat builds; survives `./gradlew clean`.
  'org.gradle.caching': 'true',
  // Configure only the subprojects required for the requested tasks.
  'org.gradle.configureondemand': 'true',
  // Daemon is on by default; explicit for clarity.
  'org.gradle.daemon': 'true',
  // RN + new arch routinely needs >2GB; G1GC reduces long pauses.
  'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseG1GC -Dfile.encoding=UTF-8',
  // Modern AGP defaults that drop transitive R class generation.
  'android.nonTransitiveRClass': 'true',
  'android.nonFinalResIds': 'true',
  // Local dev only ever targets the connected device's ABI. Apple Silicon
  // emulators and most physical test devices are arm64-v8a. Override on
  // the CLI when building multi-arch release artifacts:
  //   ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,x86_64
  reactNativeArchitectures: 'arm64-v8a',
};

const withFastGradleProperties: ConfigPlugin = (cfg) =>
  withGradleProperties(cfg, (mod) => {
    for (const [key, value] of Object.entries(FAST_BUILD_PROPERTIES)) {
      const props = mod.modResults as GradlePropertiesItem[];
      const existing = props.findIndex((entry) => entry.type === 'property' && entry.key === key);
      const next: GradlePropertiesItem = { type: 'property', key, value };
      if (existing >= 0) {
        props[existing] = next;
      } else {
        props.push(next);
      }
    }
    return mod;
  });

// The OneSignalWidget Live Activities extension lives outside what
// onesignal-expo-plugin manages, so its `OneSignalXCFramework` Cocoapods
// dependency has to be re-declared in the Podfile on every prebuild.
// Without this, the Widget target compiles its own Swift sources but
// can't `import OneSignalLiveActivities` and the build fails at link time.
const WIDGET_TARGET_NAME = 'OneSignalWidgetExtension';
const WIDGET_PODFILE_BLOCK = `
target '${WIDGET_TARGET_NAME}' do
  pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
end
`;

const withWidgetPodfileTarget: ConfigPlugin = (cfg) =>
  withDangerousMod(cfg, [
    'ios',
    async (mod) => {
      const podfilePath = path.join(mod.modRequest.platformProjectRoot, 'Podfile');
      const podfile = await fs.promises.readFile(podfilePath, 'utf8');
      if (podfile.includes(`target '${WIDGET_TARGET_NAME}'`)) {
        return mod;
      }
      await fs.promises.writeFile(podfilePath, podfile.trimEnd() + '\n' + WIDGET_PODFILE_BLOCK);
      return mod;
    },
  ]);

// `plugins` only accepts the JSON-serializable form (string or [string,
// props]) per the ExpoConfig type, so inline `ConfigPlugin` functions
// like `withFastGradleProperties` are applied by calling them on the
// finished config instead.
export default ({ config }: ConfigContext): ExpoConfig =>
  withWidgetPodfileTarget(
    withFastGradleProperties({
      ...config,
      name: 'OneSignal Demo',
      slug: 'demo',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/icon.png',
      scheme: 'demo',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: {
        appleTeamId: '99SW8E36CT',
        icon: './assets/images/icon.png',
        bundleIdentifier: 'com.onesignal.example',
        infoPlist: {
          // For push notifications support when app is not in foreground
          UIBackgroundModes: ['remote-notification'],

          // For OneSignal location permissions
          NSLocationWhenInUseUsageDescription: 'This app uses your location to...',

          // Enable iOS Live Activities (ActivityKit). Required by the
          // OneSignalWidget extension; without this the widget runs but the
          // system never starts/updates activities.
          NSSupportsLiveActivities: true,
        },
        entitlements: {
          'aps-environment': 'development', // For push notifications support
          'com.apple.security.application-groups': ['group.expoNotUsed'], // Additional app groups if needed (you can have multiple app groups)
        },
        supportsTablet: true,
      },
      android: {
        package: 'com.onesignal.example',
        // For OneSignal location permissions
        permissions: [
          'android.permission.ACCESS_COARSE_LOCATION',
          'android.permission.ACCESS_FINE_LOCATION',
        ],
      },
      plugins: [
        [
          'onesignal-expo-plugin',
          {
            mode: 'development',
            appGroupName: 'group.com.onesignal.example.NSE', // Optional: If you had your own app group name, you can set it here
            nseBundleIdentifier: 'NSE', // Optional: Custom bundle identifier for the Notification Service Extension
            smallIcons: ['./assets/images/small_icon.png'], // Optional: Custom notification icon (left side icon)
            smallIconAccentColor: '#C0FFEE', // Optional: For Android only
            largeIcons: ['./assets/images/icon.png'], // Optional: For Android only (right side icon)
            sounds: ['./assets/vine_boom.wav'], // Optional: Custom notification sounds
          } satisfies OneSignalPluginProps,
        ],
        'expo-router',
        [
          'expo-splash-screen',
          {
            image: './assets/images/icon.png',
            imageWidth: 200,
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
            dark: {
              backgroundColor: '#000000',
            },
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
      extra: {
        oneSignalAppId: '77e32082-ea27-42e3-a898-c72e141824ef',
      },
    }),
  );
