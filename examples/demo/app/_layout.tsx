import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OneSignalLogo from '../assets/onesignal_logo.svg';
import AppHeader from '../src/components/AppHeader';
import { ToastProvider } from '../src/components/ToastProvider';
import { OneSignalProvider } from '../src/hooks/useOneSignal';
import TooltipHelper from '../src/services/TooltipHelper';
import { AppColors } from '../src/theme';

export default function RootLayout() {
  useEffect(() => {
    void TooltipHelper.getInstance().init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <ToastProvider>
        <OneSignalProvider>
          <Stack
            screenOptions={{
              header: (props) => <AppHeader {...props} />,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerTitle: () => (
                  <View style={headerStyles.container}>
                    <OneSignalLogo height={22} width={99} style={headerStyles.logo} />
                    <Text style={headerStyles.subtitle}>Expo</Text>
                  </View>
                ),
              }}
            />
            <Stack.Screen name="secondary" options={{ title: 'Secondary Activity' }} />
          </Stack>
        </OneSignalProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: AppColors.white,
  },
});
