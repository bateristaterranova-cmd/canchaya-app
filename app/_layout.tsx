import 'react-native-reanimated';

import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/lib/store';

export default function RootLayout() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!hasCompletedOnboarding) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="help" />
          <Stack.Screen name="complex/[id]" />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="checkout" />
        </Stack>
        <Redirect href="/onboarding" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="help" />
          <Stack.Screen name="complex/[id]" />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="checkout" />
        </Stack>
        <Redirect href="/auth" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="help" />
        <Stack.Screen name="complex/[id]" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="checkout" />
      </Stack>
    </SafeAreaView>
  );
}
