import { Tabs } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useAppStore } from '../../lib/store';
import { View } from 'react-native';

export default function TabLayout() {
  const { isDarkMode } = useAppStore();
  
  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0A0A0A' : '#FFFFFF' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
        tabBar={() => <BottomNav />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="activity" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
