Pod::Spec.new do |s|
  s.name           = 'ExpoNotificationsDelegate'
  s.version        = '1.0.0'
  s.summary        = 'Sets expo-notifications as the UNUserNotificationCenter delegate alongside OneSignal'
  s.description    = s.summary
  s.author         = ''
  s.homepage       = 'https://github.com/OneSignal/onesignal-expo-plugin'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'EXNotifications'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
