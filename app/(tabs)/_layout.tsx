import { Tabs } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useAppStore } from '../../lib/store';
import { View } from 'react-native';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  const { isDarkMode } = useAppStore();

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? Colors.backgroundDark : Colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          animation: 'none',
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
