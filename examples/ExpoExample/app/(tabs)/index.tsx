import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginModal } from '@/components/LoginModal';
import { ThemedText } from '@/components/themed-text';
import { useFocusEffect } from 'expo-router';
import {
  LogLevel,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
  OneSignal,
} from 'react-native-onesignal';

const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

export default function HomeScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const initOneSignal = async () => {
        console.log('Initializing OneSignal');
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        OneSignal.initialize(APP_ID);
        OneSignal.Notifications.requestPermission(false);
      };
      initOneSignal();

      const foregroundWillDisplay = async (
        event: NotificationWillDisplayEvent,
      ) => {
        const notif = event.getNotification();
        console.log('Foreground will display: ', notif.title);
        notif.display();
      };

      const clickEvent = async (event: NotificationClickEvent) => {
        const notif = event.notification;
        console.log('Notification clicked: ', notif.title);
      };

      // listerners
      OneSignal.Notifications.addEventListener(
        'foregroundWillDisplay',
        foregroundWillDisplay,
      );
      OneSignal.Notifications.addEventListener('click', clickEvent);
      return () => {
        OneSignal.Notifications.removeEventListener(
          'foregroundWillDisplay',
          foregroundWillDisplay,
        );
        OneSignal.Notifications.removeEventListener('click', clickEvent);
      };
    }, []),
  );

  const handleLogin = (externalId: string) => {
    OneSignal.login(externalId);
    setLoginModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ThemedText>OneSignal Example</ThemedText>
        <ThemedText>App ID: {APP_ID}</ThemedText>

        <View style={{ width: '100%', padding: 16, gap: 8 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>
            User
          </ThemedText>
          <Pressable
            onPress={() => setLoginModalVisible(true)}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          >
            <ThemedText style={{ color: '#fff', textAlign: 'center' }}>
              Login
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={async () => {
              const externalId = await OneSignal.User.getExternalId();
              console.log('External ID: ', externalId);
            }}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          >
            <ThemedText style={{ color: '#fff', textAlign: 'center' }}>
              External ID
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={async () => {
              const onesignalId = await OneSignal.User.getOnesignalId();
              console.log('OneSignal ID: ', onesignalId);
            }}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          >
            <ThemedText style={{ color: '#fff', textAlign: 'center' }}>
              Get OneSignal ID
            </ThemedText>
          </Pressable>
        </View>

        <View style={{ width: '100%', padding: 16, gap: 8 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>
            Notifications
          </ThemedText>
          <Pressable
            onPress={() => OneSignal.Notifications.requestPermission(true)}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          >
            <ThemedText style={{ color: '#fff', textAlign: 'center' }}>
              Request Permission
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={async () => {
              const pushSubscriptionId =
                await OneSignal.User.pushSubscription.getIdAsync();
              console.log('Push Subscription ID: ', pushSubscriptionId);
            }}
            style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          >
            <ThemedText style={{ color: '#fff', textAlign: 'center' }}>
              Get Push Subscription ID
            </ThemedText>
          </Pressable>
        </View>

        {/* Modals */}
        <LoginModal
          visible={loginModalVisible}
          onClose={() => setLoginModalVisible(false)}
          onLogin={handleLogin}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
