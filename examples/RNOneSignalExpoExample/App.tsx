import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import OneSignal from 'react-native-onesignal';

const initOneSignal = () => {
  OneSignal.setAppId("8fbf6c72-4b80-47a8-86ae-68de02259355");
  OneSignal.setLogLevel(6, 0);
  OneSignal.promptForPushNotificationsWithUserResponse(response => {
    console.log(response);
  });
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
