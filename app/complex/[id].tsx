import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockComplexes, formatPrice } from '@/lib/mock-data';
import { Colors, GlassShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';

export default function ComplexDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const complex = mockComplexes.find((c) => c.id === id);

  if (!complex) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Complejo</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>Complejo no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: complex.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay}>
            <Pressable onPress={() => router.back()} style={styles.heroBackButton}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.complexName}>{complex.name}</Text>
          <View style={styles.districtRow}>
            <Ionicons name="location" size={16} color={Colors.neonGreen} />
            <Text style={styles.districtText}>{complex.district}</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text style={styles.ratingText}>{complex.rating}</Text>
            </View>
            <Text style={styles.priceRange}>
              {formatPrice(complex.minPrice)} - {formatPrice(complex.maxPrice)}/h
            </Text>
          </View>

          <Text style={styles.description}>{complex.description}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Servicios</Text>
          <View style={styles.amenitiesGrid}>
            {complex.amenities.map((amenity, index) => (
              <GlassCard key={index} style={styles.amenityCard}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </GlassCard>
            ))}
          </View>

          {/* Courts */}
          <Text style={styles.sectionTitle}>Canchas</Text>
          {complex.courts.map((court) => (
            <GlassCard key={court.id} style={styles.courtCard}>
              <Image source={{ uri: court.image }} style={styles.courtImage} contentFit="cover" />
              <View style={styles.courtInfo}>
                <Text style={styles.courtName}>{court.name}</Text>
                <Text style={styles.courtSurface}>{court.surface}</Text>
                <Text style={styles.courtPrice}>{formatPrice(court.pricePerHour)}/h</Text>
              </View>
            </GlassCard>
          ))}

          {/* Book button */}
          <View style={styles.bookSection}>
            <NeonButton
              title="Reservar ahora"
              onPress={() => {}}
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2E8F0',
  },
  heroOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  heroBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  complexName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  districtText: {
    fontSize: 15,
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  priceRange: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.neonGreen,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 12,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityCard: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  courtCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  courtImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  courtInfo: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  courtName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  courtSurface: {
    fontSize: 13,
    color: '#64748B',
  },
  courtPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.neonGreen,
    marginTop: 4,
  },
  bookSection: {
    marginTop: 24,
    marginBottom: 40,
  },
});
