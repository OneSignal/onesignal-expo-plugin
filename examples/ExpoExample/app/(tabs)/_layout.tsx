import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/Colors';

function HomeIcon() {
  return <Text style={{ fontSize: 24 }}>🏠</Text>;
}

function DetailsIcon() {
  return <Text style={{ fontSize: 24 }}>ℹ️</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <HomeIcon />,
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: 'Details',
          tabBarIcon: () => <DetailsIcon />,
        }}
      />
    </Tabs>
  );
}
