import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows } from '../constants/theme';
import { useAppStore } from '../lib/store';

interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
  padding?: number;
  noPadding?: boolean;
}

export function GlassCard({ children, style, padding = 16, noPadding }: GlassCardProps) {
  const { isDarkMode } = useAppStore();
  const isDark = isDarkMode;
  
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
}

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
