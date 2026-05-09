import React, { useEffect, useRef, useState } from 'react';
import { Animated, ViewStyle } from 'react-native';

// ─── FadeInView (entering animations) ────────────────────────────────────────

type AnimationType = 'fadeIn' | 'fadeInDown' | 'slideInUp' | 'none';

interface FadeInViewProps {
  children: React.ReactNode;
  type?: AnimationType;
  duration?: number;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Reusable entering-animation component that replaces react-native-reanimated's
 * FadeIn, FadeInDown, and SlideInUp layout animations using React Native's
 * built-in Animated API.
 *
 * Usage:
 *   <FadeInView type="fadeInDown" delay={200}>
 *     <Text>Hello</Text>
 *   </FadeInView>
 */
export function FadeInView({
  children,
  type = 'fadeIn',
  duration = 400,
  delay = 0,
  style,
}: FadeInViewProps) {
  // Animated values – useRef so they survive re-renders without recreation
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set initial values based on animation type
    switch (type) {
      case 'fadeIn':
        opacity.setValue(0);
        break;
      case 'fadeInDown':
        opacity.setValue(0);
        translateY.setValue(20);
        break;
      case 'slideInUp':
        opacity.setValue(1);
        translateY.setValue(300);
        break;
      case 'none':
      default:
        opacity.setValue(1);
        translateY.setValue(0);
        return; // no animation
    }

    const animate = () => {
      switch (type) {
        case 'fadeIn':
          return Animated.timing(opacity, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          });

        case 'fadeInDown':
          return Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]);

        case 'slideInUp':
          return Animated.spring(translateY, {
            toValue: 0,
            damping: 15,
            delay,
            useNativeDriver: true,
          });

        default:
          return Animated.timing(opacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          });
      }
    };

    animate().start();

    // No cleanup – letting the animation finish is intentional.
    // If the component unmounts mid-animation the native driver handles it safely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, duration, delay]);

  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// ─── SlideOutView (exiting animations) ───────────────────────────────────────

type SlideOutType = 'slideOutDown';

interface SlideOutViewProps {
  children: React.ReactNode;
  type?: SlideOutType;
  duration?: number;
  delay?: number;
  style?: ViewStyle | ViewStyle[];
  visible: boolean;
  onComplete?: () => void;
}

/**
 * Exiting-animation component that replaces react-native-reanimated's
 * SlideOutDown layout animation.
 *
 * When `visible` becomes false the component animates out (slides down +
 * fades out) and returns null once the animation finishes.
 *
 * Usage:
 *   <SlideOutView
 *     visible={showPanel}
 *     type="slideOutDown"
 *     onComplete={() => console.log('gone')}
 *   >
 *     <Panel />
 *   </SlideOutView>
 */
export function SlideOutView({
  children,
  type = 'slideOutDown',
  duration = 400,
  delay = 0,
  style,
  visible,
  onComplete,
}: SlideOutViewProps) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : 300)).current;

  // Track whether we should render content at all.
  // We keep rendering while the exit animation is in progress.
  const [shouldRender, setShouldRender] = useState(visible);
  const isAnimatingOut = useRef(false);

  useEffect(() => {
    if (visible) {
      // Becoming visible – render immediately and animate in
      isAnimatingOut.current = false;
      setShouldRender(true);
      opacity.setValue(0);
      translateY.setValue(type === 'slideOutDown' ? 300 : 0);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Becoming hidden – animate out, then remove from tree
      isAnimatingOut.current = true;

      const animations: Animated.CompositeAnimation[] = [
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        }),
      ];

      if (type === 'slideOutDown') {
        animations.push(
          Animated.timing(translateY, {
            toValue: 300,
            duration,
            delay,
            useNativeDriver: true,
          }),
        );
      }

      Animated.parallel(animations).start(({ finished }) => {
        if (finished && isAnimatingOut.current) {
          setShouldRender(false);
          onComplete?.();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!shouldRender) {
    return null;
  }

  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
