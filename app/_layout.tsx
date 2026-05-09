import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import { Colors } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modern animated splash screen — uses RN Animated (NOT Reanimated) to avoid native crashes
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = useRef(new RNAnimated.Value(0)).current;
  const logoOpacity = useRef(new RNAnimated.Value(0)).current;
  const textOpacity = useRef(new RNAnimated.Value(0)).current;
  const subTextOpacity = useRef(new RNAnimated.Value(0)).current;
  const dot1Scale = useRef(new RNAnimated.Value(0)).current;
  const dot2Scale = useRef(new RNAnimated.Value(0)).current;
  const dot3Scale = useRef(new RNAnimated.Value(0)).current;
  const fadeOut = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    RNAnimated.sequence([
      RNAnimated.parallel([
        RNAnimated.spring(logoScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        RNAnimated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      RNAnimated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      RNAnimated.timing(subTextOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      RNAnimated.stagger(150, [
        RNAnimated.spring(dot1Scale, { toValue: 1, friction: 3, useNativeDriver: true }),
        RNAnimated.spring(dot2Scale, { toValue: 1, friction: 3, useNativeDriver: true }),
        RNAnimated.spring(dot3Scale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]),
      RNAnimated.delay(600),
      RNAnimated.timing(fadeOut, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <RNAnimated.View style={[styles.splashContainer, { opacity: fadeOut }]}>
      <View style={styles.splashDecor1} />
      <View style={styles.splashDecor2} />
      <View style={styles.splashDecor3} />
      <RNAnimated.View style={[styles.splashLogoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <View style={styles.splashLogoCircle}>
          <Ionicons name="football" size={48} color="#FFF" />
        </View>
      </RNAnimated.View>
      <RNAnimated.View style={{ opacity: textOpacity }}>
        <Text style={styles.splashTitle}>CanchaYa</Text>
      </RNAnimated.View>
      <RNAnimated.View style={{ opacity: subTextOpacity }}>
        <Text style={styles.splashSubTitle}>Tu cancha, tu partida</Text>
      </RNAnimated.View>
      <View style={styles.splashDotsRow}>
        <RNAnimated.View style={[styles.splashDot, { transform: [{ scale: dot1Scale }] }]} />
        <RNAnimated.View style={[styles.splashDot, { transform: [{ scale: dot2Scale }] }]} />
        <RNAnimated.View style={[styles.splashDot, { transform: [{ scale: dot3Scale }] }]} />
      </View>
    </RNAnimated.View>
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
          contentStyle: {
            backgroundColor: isDarkMode ? '#0A0A0A' : '#FFFFFF',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detail" options={{ headerShown: false }} />
        <Stack.Screen name="schedule" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
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
