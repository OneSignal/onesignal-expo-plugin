import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AppStateProvider } from '@/context/AppStateContext';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar barStyle="light-content" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppStateProvider>
  );
}
