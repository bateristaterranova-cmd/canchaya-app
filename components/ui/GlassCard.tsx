import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, GlassShadows } from '@/lib/theme';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
  isDark?: boolean;
}

export default function GlassCard({ children, className, style, isDark }: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
          isDark ? GlassShadows.dark : GlassShadows.light,
          style,
        ]}
      >
        {children}
      </BlurView>
    );
  }

  // Android fallback: semi-transparent View
  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDarkFallback : styles.containerLightFallback,
        isDark ? styles.containerDark : styles.containerLight,
        isDark ? GlassShadows.dark : GlassShadows.light,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  containerLight: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  containerDark: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  containerLightFallback: {
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  containerDarkFallback: {
    backgroundColor: 'rgba(30,41,59,0.7)',
  },
});
