import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { Colors } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  emoji: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
}

const SLIDES: Slide[] = [
  {
    emoji: '🏟️',
    title: 'Reserva canchas deportivas',
    subtitle: 'Encuentra canchas deportivas cerca de ti en segundos',
    gradient: ['#0F172A', '#1E3A5F'],
  },
  {
    emoji: '⚽',
    title: 'Elige tu cancha favorita',
    subtitle: 'Filtra por tipo de cancha, precio y ubicación',
    gradient: ['#0F172A', '#1A3D2E'],
  },
  {
    emoji: '🎉',
    title: 'Reserva en segundos',
    subtitle: 'Reserva y paga al instante sin complicaciones',
    gradient: ['#0F172A', '#2D1B4E'],
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleStart = () => {
    completeOnboarding();
  };

  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={{ width: SCREEN_WIDTH }}>
            <LinearGradient
              colors={slide.gradient}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <SafeAreaView className="flex-1 items-center justify-center px-8">
                {/* Decorative blurred circles */}
                <View className="absolute top-20 left-8 w-40 h-40 rounded-full opacity-10"
                  style={{ backgroundColor: Colors.neonGreen }}
                />
                <View className="absolute bottom-40 right-4 w-32 h-32 rounded-full opacity-10"
                  style={{ backgroundColor: Colors.neonGreen }}
                />

                {/* Emoji */}
                <Animated.View
                  entering={FadeIn.duration(600).delay(200)}
                  className="w-32 h-32 rounded-full items-center justify-center mb-8"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <Text className="text-7xl">{slide.emoji}</Text>
                </Animated.View>

                {/* Title */}
                <Animated.Text
                  entering={FadeIn.duration(600).delay(400)}
                  className="text-3xl font-bold text-white text-center mb-4"
                >
                  {slide.title}
                </Animated.Text>

                {/* Subtitle */}
                <Animated.Text
                  entering={FadeIn.duration(600).delay(600)}
                  className="text-lg text-gray-300 text-center max-w-xs leading-7"
                >
                  {slide.subtitle}
                </Animated.Text>
              </SafeAreaView>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View
        className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-6"
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Dot indicators */}
        <View className="flex-row justify-center mb-8 gap-2">
          {SLIDES.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => goToSlide(index)}
              className="h-2 rounded-full transition-all"
              style={{
                width: currentSlide === index ? 24 : 8,
                backgroundColor:
                  currentSlide === index ? Colors.neonGreen : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row items-center justify-between">
          {/* Skip button */}
          {!isLastSlide ? (
            <Pressable onPress={handleSkip} className="px-4 py-3">
              <Text className="text-white/60 text-base font-medium">
                Saltar
              </Text>
            </Pressable>
          ) : (
            <View className="px-4 py-3" />
          )}

          {/* Next / Start button */}
          <Pressable
            onPress={isLastSlide ? handleStart : handleNext}
            className="px-8 py-4 rounded-2xl flex-row items-center"
            style={{
              backgroundColor: Colors.neonGreen,
              shadowColor: Colors.neonGreen,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
              elevation: 6,
            }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: '#0F172A' }}
            >
              {isLastSlide ? 'Comenzar' : 'Siguiente'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
