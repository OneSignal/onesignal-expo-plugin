# Expo Application Services
EAS is Expo's cloud-build service.

## [EAS Homepage](https://expo.dev/eas)

## EAS + OneSignal Setup
To get OneSignal push notifications working in an EAS-built app, see our guide on how to configure your [iOS credentials](IOS_CREDENTIALS_EAS.md).

## How to run an iOS EAS-built app
### Run in a production environment
For production builds, your generated ipa file should to be distributed to the App Store or Testflight.


### Run in custom development client
For development/internal distribution builds, you will need to install a [development client](https://docs.expo.dev/development/getting-started/) on your iOS device.

1. Scan the QR code shown in the terminal after EAS build success and install the development client application to your device.
2. In the terminal, run `expo start --dev-client` to be able to serve the application to the client.
3. Scan the generated QR code to open the dev client and fetch the app bundle from the running Expo process.
4. You may be prompted to allow the app to find local area network devices. Approve.
5. Rescan the QR code & open the app. At this point, you should see the mero bundler working. As soon as the bundle is complete, your working app should open!