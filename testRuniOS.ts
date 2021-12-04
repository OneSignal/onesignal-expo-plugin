import { xcodeProjectAddNse } from "./onesignal/withOneSignalIos";

// Quick testing on any Xcode project

// 1. Update values for your project
// 2. Run `yarn build` from here
// 3. Open a terminal to the root of your Xcode project
// 4. Run `node ~/WHERE_YOU_CLONED_ME/onesignal-expo-plugin/build/testRuniOS.js`
// 5. Run `pod init`, if you haven't already.
//    - Make sure you are testing with 2 targets in your Podfile, your main target AND your NSE
//    - If you forget your main target in your Podfile you will get the
//     "Please add the host targets for the embedded targets to the Podfile." error
//      even if your .xcodeproj is correct.
xcodeProjectAddNse(
    "XcodeTestProj", 
    ".", 
    "com.onesignal.XcodeTestProj",
    "99SW8E36CT",
    "../../repos/onesignal-expo-plugin/support/serviceExtensionFiles/"
); 
