# Changelog
All notable changes to this project will be documented in this file.

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
