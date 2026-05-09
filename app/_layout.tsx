import 'react-native-reanimated';

import { Redirect, Stack } from 'expo-router';
import { useAppStore } from '@/lib/store';

export default function RootLayout() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const screenOptions = { headerShown: false };

  if (!hasCompletedOnboarding) {
    return (
      <>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail" />
          <Stack.Screen name="complex/[id]" />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="help" />
        </Stack>
        <Redirect href="/onboarding" />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail" />
          <Stack.Screen name="complex/[id]" />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="help" />
        </Stack>
        <Redirect href="/auth" />
      </>
    );
  }

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="complex/[id]" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
