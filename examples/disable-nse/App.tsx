import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';

const appId = Constants.expoConfig?.extra?.oneSignalAppId ?? '';

async function sendTestNotification(subscriptionId: string) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.onesignal.v1+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      include_subscription_ids: [subscriptionId],
      headings: { en: 'Test Notification' },
      contents: { en: 'This is a test push without the NSE.' },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
}

export default function App() {
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(appId);
    OneSignal.login('test-disable-nse');
    void OneSignal.Notifications.requestPermission(true);

    OneSignal.User.pushSubscription.addEventListener('change', (event) => {
      setSubscriptionId(event.current.id ?? null);
    });
    void OneSignal.User.pushSubscription.getIdAsync().then((id) => setSubscriptionId(id ?? null));
  }, []);

  const handleSend = async () => {
    if (!subscriptionId) {
      Alert.alert('Not subscribed', 'No push subscription ID available yet.');
      return;
    }
    try {
      await sendTestNotification(subscriptionId);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OneSignal — NSE Disabled</Text>
      <Text style={styles.subtitle}>
        Basic push notifications without the Notification Service Extension.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleSend}
      >
        <Text style={styles.buttonText}>Send Test Notification</Text>
      </Pressable>
      <Text style={styles.subscriptionId}>
        {subscriptionId ? `Sub ID: ${subscriptionId}` : 'Waiting for subscription...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#e54b4d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  subscriptionId: {
    fontSize: 11,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
