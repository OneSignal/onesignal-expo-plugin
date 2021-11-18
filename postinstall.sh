#!/bin/bash
if [ -d "../../ios" ]
then
  echo "
target 'OneSignalNotificationServiceExtension' do
  pod 'OneSignal', '>= 3.0', '< 4.0'
end" >> ../../ios/Podfile
else
  cd ../../ && expo prebuild
    echo "
target 'OneSignalNotificationServiceExtension' do
  pod 'OneSignal', '>= 3.0', '< 4.0'
end" >> ../../ios/Podfile
fi
