import EXNotifications
import ExpoModulesCore
import UserNotifications

public class ExpoNotificationsDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // OneSignal sets a placeholder delegate before launch, so expo-notifications skips registration.
    // OneSignal wraps the delegate assigned here and forwards non-OneSignal notifications to it.
    UNUserNotificationCenter.current().delegate = NotificationCenterManager.shared
    return true
  }
}
