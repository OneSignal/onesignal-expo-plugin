const { withProjectBuildGradle } = require('expo/config-plugins');

// Version published to ~/.m2 from the OneSignal-Android-SDK
// `firebase-installation-ids` branch via `./gradlew publishToMavenLocal`.
const ONESIGNAL_ANDROID_VERSION = process.env.ONESIGNAL_ANDROID_VERSION ?? '5.11.0-fid-local';

// FID registration needs firebase-messaging 25.1.0+; the OneSignal
// notifications module only prefers 24.0.0, so pin it at the app level.
const FIREBASE_MESSAGING_VERSION = process.env.FIREBASE_MESSAGING_VERSION ?? '25.1.2';

const MARKER = '// onesignal demo: local OneSignal Android SDK override';

const gradleSnippet = `
${MARKER}
allprojects {
    repositories {
        mavenLocal()
    }
    configurations.all {
        resolutionStrategy {
            eachDependency { details ->
                if (details.requested.group == 'com.onesignal') {
                    details.useVersion '${ONESIGNAL_ANDROID_VERSION}'
                    details.because 'FID test: resolve every OneSignal module from mavenLocal'
                }
            }
            force 'com.google.firebase:firebase-messaging:${FIREBASE_MESSAGING_VERSION}'
        }
    }
}
`;

const withOneSignalLocalMaven = (config) =>
  withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('withOneSignalLocalMaven only supports a Groovy android/build.gradle.');
    }
    if (!config.modResults.contents.includes(MARKER)) {
      config.modResults.contents += gradleSnippet;
    }
    return config;
  });

module.exports = withOneSignalLocalMaven;
