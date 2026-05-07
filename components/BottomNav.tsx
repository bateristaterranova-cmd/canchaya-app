import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAppStore, TabType } from '../lib/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/theme';

const tabs: { id: TabType; label: string; icon: string; activeIcon: string; isCenter?: boolean }[] = [
  { id: 'home', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { id: 'activity', label: 'Actividad', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'map', label: 'Mapa', icon: 'location-outline', activeIcon: 'location', isCenter: true },
  { id: 'profile', label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
];

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

export function BottomNav() {
  const { isDarkMode, setActiveTab } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isDark = isDarkMode;

  // Derive active tab from pathname for reliability
  const activeTab = pathnameToTab[pathname] || 'home';

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    router.navigate(tabRouteMap[tab] as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? Colors.glassNavBgDark : Colors.glassNavBg,
          borderTopColor: isDark ? Colors.borderDark : Colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        isDark ? Shadows.nav.dark : Shadows.nav.light,
      ]}
    >
      <View style={styles.navInner}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isCenter) {
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.centerButtonContainer}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.centerButton,
                    { backgroundColor: Colors.primary },
                  ]}
                >
                  <Ionicons name="location" size={20} color="#111111" />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? Colors.primary : isDark ? Colors.textTertiaryDark : Colors.textTertiary,
                      fontWeight: isActive ? '700' : '500',
                      marginTop: 2,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={isActive ? (tab.activeIcon as any) : (tab.icon as any)}
                  size={isActive ? 26 : 22}
                  color={isActive ? Colors.primary : isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? Colors.primary : isDark ? Colors.textTertiaryDark : Colors.textTertiary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100,
  },
  navInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 64,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 14,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    marginTop: -16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
