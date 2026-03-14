import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';

const appId = Constants.expoConfig?.extra?.oneSignalAppId ?? '';

export default function App() {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(appId);
    OneSignal.Notifications.requestPermission(true);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OneSignal — NSE Disabled</Text>
      <Text style={styles.subtitle}>
        Basic push notifications without the Notification Service Extension.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
});
