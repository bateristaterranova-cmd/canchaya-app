import { Tabs } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useAppStore } from '../../lib/store';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  const { isDarkMode, isAuthenticated } = useAppStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        animation: 'none',
      }}
      tabBar={() => isAuthenticated ? <BottomNav /> : null}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
