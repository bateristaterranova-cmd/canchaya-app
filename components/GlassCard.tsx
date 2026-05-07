import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../constants/theme';
import { useAppStore } from '../lib/store';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  padding?: number;
  noPadding?: boolean;
}

export const GlassCard = React.memo(function GlassCard({ children, style, padding = 16, noPadding }: GlassCardProps) {
  const { isDarkMode } = useAppStore();
  const isDark = isDarkMode;

  // Web fallback: use View with semi-transparent background (BlurView not supported on web)
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.webGlass,
          {
            backgroundColor: isDark ? Colors.glassBgDark : Colors.glassBg,
            borderColor: isDark ? Colors.glassBorderDark : Colors.glassBorder,
            padding: noPadding ? 0 : padding,
          },
          isDark ? Shadows.card.dark : Shadows.card.light,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Native: use BlurView for real glassmorphism
  const { BlurView } = require('expo-blur');
  return (
    <BlurView
      intensity={isDark ? 40 : 60}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.glass,
        {
          borderColor: isDark ? Colors.glassBorderDark : Colors.glassBorder,
          padding: noPadding ? 0 : padding,
        },
        isDark ? Shadows.card.dark : Shadows.card.light,
        style,
      ]}
    >
      {children}
    </BlurView>
  );
});

const styles = StyleSheet.create({
  glass: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  webGlass: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
