import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import { mockComplexes, formatPrice } from '@/lib/mock-data';
import { Colors, GlassShadows, NeonShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';

export default function FavoritesScreen() {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const router = useRouter();

  const favoritedComplexes = mockComplexes.filter((c) => favorites.includes(c.id));

  const renderVenueCard = ({ item, index }: { item: typeof mockComplexes[0]; index: number }) => {
    const isFav = favorites.includes(item.id);

    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
        <GlassCard style={styles.venueCard}>
          <Pressable
            onPress={() => router.push(`/complex/${item.id}`)}
            style={styles.venuePressable}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.venueImage}
              contentFit="cover"
            />
            {/* Heart button */}
            <Pressable
              onPress={() => toggleFavorite(item.id)}
              style={styles.heartButton}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? '#EF4444' : '#fff'}
              />
            </Pressable>

            {/* Rating badge */}
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            {/* Content */}
            <View style={styles.venueContent}>
              <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.venueDistrictRow}>
                <Ionicons name="location" size={13} color={Colors.neonGreen} />
                <Text style={styles.venueDistrict} numberOfLines={1}>{item.district}</Text>
              </View>
              <View style={styles.venueBottomRow}>
                <View style={styles.courtBadge}>
                  <Text style={styles.courtBadgeText}>
                    {item.courts.length} canchas
                  </Text>
                </View>
                <Text style={styles.venuePrice}>
                  {formatPrice(item.minPrice)}/h
                </Text>
              </View>
              <Text style={styles.venueLink}>Ver cancha →</Text>
            </View>
          </Pressable>
        </GlassCard>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="heart-outline" size={48} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>No tienes favoritos aún</Text>
      <Text style={styles.emptySubtitle}>
        Marca tus complejos favoritos para verlos aquí
      </Text>
      <Pressable
        onPress={() => router.navigate('/(tabs)/home')}
        style={styles.emptyButton}
      >
        <Text style={styles.emptyButtonText}>Explorar canchas</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={favoritedComplexes}
        keyExtractor={(item) => item.id}
        renderItem={renderVenueCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={favoritedComplexes.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  venueCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  venuePressable: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  venueImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E2E8F0',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  venueContent: {
    padding: 14,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  venueDistrictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  venueDistrict: {
    fontSize: 13,
    color: '#64748B',
  },
  venueBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  courtBadge: {
    backgroundColor: 'rgba(57,255,20,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courtBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neonGreen,
  },
  venuePrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.neonGreen,
  },
  venueLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neonGreen,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(148,163,184,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.neonGreen,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    ...NeonShadows.md,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
