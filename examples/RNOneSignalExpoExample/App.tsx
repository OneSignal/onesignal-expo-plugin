import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { LogLevel, OneSignal } from "react-native-onesignal";

const initOneSignal = () => {
  OneSignal.initialize("8fbf6c72-4b80-47a8-86ae-68de02259355");
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  
  // Also need to enable notifications to complete OneSignal setup
  if (await OneSignal.Notifications.canRequestPermission()) {
    let permission = OneSignal.Notifications.hasPermission();
    if (!permission) {
      await OneSignal.Notifications.requestPermission(true);
    }
  }
  OneSignal.setConsentRequired(true);
  OneSignal.setConsentGiven(true);
}

export default function App() {
  initOneSignal();

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
