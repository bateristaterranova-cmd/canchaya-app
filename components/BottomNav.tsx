import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/theme';
import Animated, { useAnimatedStyle, withSpring, withTiming, useSharedValue, withRepeat } from 'react-native-reanimated';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const tabs = [
  { id: 'home' as const, label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { id: 'activity' as const, label: 'Actividad', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'map' as const, label: 'Mapa', icon: 'location-outline', activeIcon: 'location', isCenter: true },
  { id: 'profile' as const, label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
];

export function BottomNav() {
  const { activeTab, setActiveTab, isDarkMode } = useAppStore();
  const insets = useSafeAreaInsets();
  
  const isDark = isDarkMode;
  
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
            return <CenterMapButton key={tab.id} isActive={isActive} onPress={() => setActiveTab(tab.id)} />;
          }
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.tabContent, isActive && styles.activeTabContent]}>
                <Ionicons
                  name={isActive ? tab.activeIcon as any : tab.icon as any}
                  size={isActive ? 26 : 22}
                  color={isActive ? Colors.primary : (isDark ? Colors.textTertiaryDark : Colors.textTertiary)}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? Colors.primary : (isDark ? Colors.textTertiaryDark : Colors.textTertiary),
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View style={styles.activeIndicator} />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function CenterMapButton({ isActive, onPress }: { isActive: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(isActive ? 0.6 : 0.3, { duration: 1500 }),
      -1,
      true
    );
  }, [isActive]);
  
  const glowStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    opacity: glowOpacity.value,
  }));
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.centerButtonContainer}
    >
      <Animated.View style={glowStyle} />
      <View
        style={[
          styles.centerButton,
          {
            backgroundColor: Colors.primary,
          },
        ]}
      >
        <Ionicons name="location" size={22} color="#111" />
      </View>
      <Text
        style={[
          styles.tabLabel,
          {
            color: isActive ? Colors.primary : (Colors.textTertiary),
            fontWeight: isActive ? '700' : '500',
            marginTop: 2,
          },
        ]}
      >
        Mapa
      </Text>
    </TouchableOpacity>
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
    height: 68,
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
  activeTabContent: {
    transform: [{ translateY: -2 }],
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 12,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
