import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../lib/store';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const { isDarkMode } = useAppStore();
  const systemColorScheme = useColorScheme();
  const isDark = isDarkMode;
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          presentation: 'card',
          contentStyle: {
            backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="detail" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="schedule" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="checkout" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
    </>
  );
}
