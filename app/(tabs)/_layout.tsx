import { Tabs } from 'expo-router';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/lib/theme';

const TAB_CONFIG = [
  { name: 'home', title: 'Home', icon: 'home' as const, iconActive: 'home' as const },
  { name: 'activity', title: 'Activity', icon: 'calendar' as const, iconActive: 'calendar' as const },
  { name: 'map', title: 'Map', icon: 'map' as const, iconActive: 'map' as const },
  { name: 'profile', title: 'Profile', icon: 'person' as const, iconActive: 'person' as const },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <BlurView intensity={60} tint="light" style={styles.blurView}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const tabConfig = TAB_CONFIG.find((t) => t.name === route.name);
            const isMap = route.name === 'map';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            if (isMap) {
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.mapButtonContainer}
                  android_ripple={{ color: 'rgba(57,255,20,0.2)', borderless: true }}
                >
                  <View style={styles.mapButtonCircle}>
                    <Ionicons
                      name={tabConfig?.icon || 'map'}
                      size={28}
                      color="#0F172A"
                    />
                  </View>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
                android_ripple={{ color: 'transparent' }}
              >
                <Ionicons
                  name={isFocused ? (tabConfig?.iconActive || tabConfig?.icon || 'home') : (tabConfig?.icon || 'home') + '-outline'}
                  size={24}
                  color={isFocused ? Colors.neonGreen : '#94A3B8'}
                />
                {isFocused && <View style={styles.activeBar} />}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  blurView: {
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginHorizontal: 8,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  activeBar: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.neonGreen,
    marginTop: 4,
  },
  mapButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  mapButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
});
