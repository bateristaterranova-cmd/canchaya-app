import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import { Colors } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modern animated splash screen
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = new Animated.Value(0);
  const logoOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);
  const subTextOpacity = new Animated.Value(0);
  const dot1Scale = new Animated.Value(0);
  const dot2Scale = new Animated.Value(0);
  const dot3Scale = new Animated.Value(0);
  const fadeOut = new Animated.Value(1);

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Title fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      // Subtitle fades in
      Animated.timing(subTextOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      // Loading dots appear one by one
      Animated.stagger(150, [
        Animated.spring(dot1Scale, { toValue: 1, friction: 3, useNativeDriver: true }),
        Animated.spring(dot2Scale, { toValue: 1, friction: 3, useNativeDriver: true }),
        Animated.spring(dot3Scale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]),
      // Hold for a moment
      Animated.delay(600),
      // Fade out everything
      Animated.timing(fadeOut, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeOut }]}>
      {/* Decorative circles */}
      <View style={styles.splashDecor1} />
      <View style={styles.splashDecor2} />
      <View style={styles.splashDecor3} />

      {/* Logo */}
      <Animated.View style={[styles.splashLogoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <View style={styles.splashLogoCircle}>
          <Ionicons name="football" size={48} color="#FFF" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.splashTitle}>CanchaYa</Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={{ opacity: subTextOpacity }}>
        <Text style={styles.splashSubTitle}>Tu cancha, tu partida</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.splashDotsRow}>
        <Animated.View style={[styles.splashDot, { transform: [{ scale: dot1Scale }] }]} />
        <Animated.View style={[styles.splashDot, { transform: [{ scale: dot2Scale }] }]} />
        <Animated.View style={[styles.splashDot, { transform: [{ scale: dot3Scale }] }]} />
      </View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const { isDarkMode } = useAppStore();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right',
          animationDuration: 200,
          contentStyle: {
            backgroundColor: isDarkMode ? '#0A0A0A' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="detail" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
        <Stack.Screen name="schedule" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, animation: Platform.OS === 'web' ? 'fade' : 'slide_from_right' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  splashDecor1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  splashDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  splashDecor3: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.35,
    left: SCREEN_WIDTH * 0.15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  splashLogoWrap: {
    marginBottom: 20,
  },
  splashLogoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  splashTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  splashSubTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 2,
  },
  splashDotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 40,
  },
  splashDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});
