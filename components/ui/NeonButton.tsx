import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors, NeonShadows } from '@/lib/theme';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const SIZE_MAP = {
  sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, borderRadius: 10 },
  md: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 15, borderRadius: 12 },
  lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 17, borderRadius: 14 },
};

export default function NeonButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
}: NeonButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(withTiming(1.05, { duration: 100 }), withTiming(1, { duration: 100 }));
  };

  const sizeConfig = SIZE_MAP[size];

  const getContainerStyle = () => {
    const base: any[] = [
      styles.base,
      {
        paddingVertical: sizeConfig.paddingVertical,
        paddingHorizontal: sizeConfig.paddingHorizontal,
        borderRadius: sizeConfig.borderRadius,
      },
    ];

    if (disabled || loading) {
      base.push(styles.disabled);
      return base;
    }

    switch (variant) {
      case 'primary':
        base.push(styles.primary);
        base.push(NeonShadows.md);
        break;
      case 'secondary':
        base.push(styles.secondary);
        break;
      case 'outline':
        base.push(styles.outline);
        break;
    }

    return base;
  };

  const getTextStyle = () => {
    const base: any[] = [{ fontSize: sizeConfig.fontSize, fontWeight: '700' }];

    if (disabled || loading) {
      base.push({ color: '#94A3B8' });
      return base;
    }

    switch (variant) {
      case 'primary':
        base.push({ color: '#0F172A' });
        break;
      case 'secondary':
        base.push({ color: Colors.neonGreen });
        break;
      case 'outline':
        base.push({ color: '#94A3B8' });
        break;
    }

    return base;
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={getContainerStyle()}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#0F172A' : Colors.neonGreen}
          />
        ) : (
          <Text style={getTextStyle()}>
            {icon ? `${icon} ` : ''}{title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.neonGreen,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.neonGreen,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  disabled: {
    backgroundColor: '#E2E8F0',
  },
});
