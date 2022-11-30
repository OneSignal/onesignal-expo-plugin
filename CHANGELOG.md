# Changelog
All notable changes to this project will be documented in this file.

## November 2022
### `1.3.0` - 11/30/22
#### Changes
- Add `iosNSEFilePath` configuration options to the plugin, which allows an app to specify a custom iOS Notification Service Extension.

## October 2022
### `1.2.0` - 10/25/22
#### Changes
- Add `smallIcons` and `largeIcons` configuration options to the plugin, which allows an app to specify large and small notification icons to package within the Android build.
- Bump jpeg-js from 0.4.3 to 0.4.4
- Bump simple-plist from 1.3.0 to 1.3.1

### `1.1.2` - 10/04/22
#### Fixes
- Specify `use_frameworks` on `OneSignalNotificationServiceExtension` target in iOS Podfile when applicable (i.e. the app target also specifies `use_frameworks`).

## September 2022
### `1.1.1` - 09/06/22
#### Fixes
- Fix issue where EAS release builds were no longer successfully building due to log statement

### `1.1.0` - 09/01/22
#### Changes
- No longer inject the OneSignal Gradle plugin on Android builds
#### Fixes
- Fix issue where plugin does not support monorepos

## April 2022
### `1.0.1` - 04/11/22

#### Changes
- Add more info regarding the `expo prebuild` command to README.
#### Fixes
- Upstream EAS workaround for "Missing Push Capability on iOS" issue. Adds `aps-environment` entitlement to NSE template. Although it is **not** required in normal builds, there is an upstream limitation from EAS that is resolved by including the push entitlement in both target entitlement files. As of 4/8/22, EAS builds will randomly pick an entitlement file if there are multiple in a project without differentiating among targets. This is resulting in flaky builds where half the time they work and half the time they don't. This can be seen as a temporary fix. Note it carries no side-effects / repercussions (i.e: the entitlement is superfluous but not critical to remove in the future).

## March 2022
### `1.0.0` - 03/28/22

#### Fixes
- Upgrade dependencies (via dependabot)
#### Changes
- Add credentials guide and update README
- Advance to General Availability

## February 2022
### `1.0.0-beta11` - 02/18/2022
#### Added
- Linting
- Instead of creating a "WriterManager", we repurpose the ReaderManager class by renaming it to FileManager and adding a synchronized write helper function (synchronous in the sense that it block further execution until complete).
- iOS constants file

#### Fixes
- Import cleanups
- Linting errors
- Write safety issu. NSE updater helper functions were previously writing to the entitlements & plist files asynchronously. We should await on each to ensure we don't have multiple writes to the same file at once (which is unsafe).

## January 2022

### `1.0.0-beta10` - 01/24/2022
#### Added
- ability to configure version numbers used in the NSE target's plist file.
- `OneSignalLog` class for better console logging.
- this changelog file.

#### Fixed
- re-running `expo prebuild` will no longer result in duplicate entitlements and dependencies added to native files.
