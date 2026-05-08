import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../constants/theme';
import { useAppStore } from '../lib/store';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  padding?: number;
  noPadding?: boolean;
  blurIntensity?: number; // Custom blur intensity for auth cards etc.
}

export const GlassCard = React.memo(function GlassCard({ children, style, padding = 16, noPadding, blurIntensity }: GlassCardProps) {
  const { isDarkMode } = useAppStore();
  const isDark = isDarkMode;

  // Web: use backdrop-filter for real Gaussian blur
  if (Platform.OS === 'web') {
    const blurPx = blurIntensity || 20;
    return (
      <View
        style={[
          styles.webGlass,
          {
            backgroundColor: isDark ? Colors.glassBgDark : Colors.glassBg,
            borderColor: isDark ? Colors.glassBorderDark : Colors.glassBorder,
            padding: noPadding ? 0 : padding,
            backdropFilter: `blur(${blurPx}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${blurPx}px) saturate(180%)`,
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
      intensity={blurIntensity || (isDark ? 40 : 60)}
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
