import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/theme';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const renderStar = (index: number) => {
    const starValue = index + 1;
    const difference = rating - index;

    let iconName: keyof typeof Ionicons.glyphMap;
    let color: string;

    if (difference >= 1) {
      iconName = 'star';
      color = Colors.neonGreen;
    } else if (difference >= 0.5) {
      iconName = 'star-half';
      color = Colors.neonGreen;
    } else {
      iconName = 'star-outline';
      color = '#CBD5E1';
    }

    const StarComponent = (
      <Ionicons
        key={index}
        name={iconName}
        size={size}
        color={color}
      />
    );

    if (interactive) {
      return (
        <Pressable
          key={index}
          onPress={() => {
            // Tap same star again to deselect
            if (starValue === rating) {
              onRatingChange?.(starValue - 1);
            } else {
              onRatingChange?.(starValue);
            }
          }}
          hitSlop={4}
          style={{ padding: 2 }}
        >
          {StarComponent}
        </Pressable>
      );
    }

    return <View key={index} style={{ padding: 2 }}>{StarComponent}</View>;
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
