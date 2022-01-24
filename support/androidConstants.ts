export const ONESIGNAL_GRADLE =
`buildscript {
    repositories {
        gradlePluginPortal()
    }
    dependencies {
        classpath 'gradle.plugin.com.onesignal:onesignal-gradle-plugin:[0.12.10, 0.99.99]'
    }
}

apply plugin: 'com.onesignal.androidsdk.onesignal-gradle-plugin'`;
