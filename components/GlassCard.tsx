import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
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
});
