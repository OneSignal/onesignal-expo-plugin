export class OneSignalLog {
  static log(str: string) {
    console.log(`\tonesignal-expo-plugin: ${str}`)
  }

  static error(str: string) {
    console.error(`\tonesignal-expo-plugin: ${str}`)
  }
}
