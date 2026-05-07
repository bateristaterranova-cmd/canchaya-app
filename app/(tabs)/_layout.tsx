import { Tabs, useRouter, usePathname } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useAppStore, TabType } from '../../lib/store';
import { View } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors } from '../../constants/theme';

const tabRouteMap: Record<TabType, string> = {
  home: '/(tabs)',
  activity: '/(tabs)/activity',
  map: '/(tabs)/map',
  profile: '/(tabs)/profile',
};

const pathnameToTab: Record<string, TabType> = {
  '/': 'home',
  '/activity': 'activity',
  '/map': 'map',
  '/profile': 'profile',
};

export default function TabLayout() {
  const { isDarkMode, activeTab, setActiveTab } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const isNavigatingRef = useRef(false);

  // Sync pathname → store (handles back button, deep links)
  useEffect(() => {
    const tab = pathnameToTab[pathname];
    if (tab && tab !== activeTab) {
      isNavigatingRef.current = true;
      setActiveTab(tab);
      // Reset flag after a tick
      setTimeout(() => { isNavigatingRef.current = false; }, 50);
    }
  }, [pathname]);

  // Sync store → router (handles BottomNav taps)
  useEffect(() => {
    if (isNavigatingRef.current) return;
    const targetRoute = tabRouteMap[activeTab];
    if (targetRoute) {
      router.navigate(targetRoute);
    }
  }, [activeTab]);

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
