import 'react-native-reanimated';

import { Redirect, Stack } from 'expo-router';
import { useAppStore } from '../lib/store';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  const bgColor = isDarkMode ? Colors.backgroundDark : '#FFFFFF';

  if (!hasCompletedOnboarding) {
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail" />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="checkout" />
        </Stack>
        <Redirect href="/(tabs)" />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail" />
          <Stack.Screen name="schedule" />
          <Stack.Screen name="checkout" />
        </Stack>
        <Redirect href="/(tabs)" />
      </>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bgColor } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="checkout" />
    </Stack>
  );
}
