import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInView } from '../components/FadeInView';

import { useAppStore } from '../lib/store';
import {
  getComplexById,
  formatPrice,
  getCourtTypeLabel,
  getReviewsByComplexId,
  getAverageRating,
} from '../lib/mock-data';
import { Colors } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const amenityIcons: Record<string, string> = {
  'Estacionamiento': 'car-outline',
  'Vestuarios': 'shirt-outline',
  'Duchas': 'water-outline',
  'Cafetería': 'cafe-outline',
  'WiFi': 'wifi-outline',
  'Iluminación LED': 'bulb-outline',
  'Cancha techada': 'umbrella-outline',
};

export default function DetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, selectedComplexId, favorites, toggleFavorite, selectCourt } = useAppStore();
  const isDark = isDarkMode;

  const complex = getComplexById(selectedComplexId || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!complex) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.emptyText, { color: isDark ? Colors.textDark : Colors.text }]}>Complejo no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allImages = [complex.image, ...complex.courts.map(c => c.image)];
  const isFav = favorites.includes(complex.id);
  const reviews = getReviewsByComplexId(complex.id);
  const avgRating = getAverageRating(complex.id);

  const handleReserve = (courtId: string) => {
    selectCourt(courtId);
    router.push('/schedule');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: allImages[activeImageIndex] }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroGradient} />
          <TouchableOpacity
            style={[styles.heroButton, { left: 16, top: (insets.top || 12) + 4 }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heroButton, { right: 16, top: (insets.top || 12) + 4 }]}
            onPress={() => toggleFavorite(complex.id)}
            activeOpacity={0.7}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? Colors.heart : '#FFF'} />
          </TouchableOpacity>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{activeImageIndex + 1}/{allImages.length}</Text>
          </View>
        </View>

        {/* Gallery thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
          {allImages.map((img, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveImageIndex(i)}
              activeOpacity={0.8}
              style={[styles.galleryThumb, activeImageIndex === i && { borderColor: Colors.primary, borderWidth: 2 }]}
            >
              <Image source={{ uri: img }} style={styles.galleryImage} contentFit="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Info */}
        <FadeInView type="fadeInDown" duration={400}>
          <View style={styles.infoSection}>
            <Text style={[styles.complexName, { color: isDark ? Colors.textDark : Colors.text }]}>{complex.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={16} color={Colors.star} />
                <Text style={styles.ratingText}>{complex.rating}</Text>
              </View>
              <View style={styles.districtRow}>
                <Ionicons name="location-outline" size={14} color={Colors.primary} />
                <Text style={[styles.districtText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{complex.district}</Text>
              </View>
            </View>
            <View style={styles.addressRow}>
              <Ionicons name="navigate-outline" size={14} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
              <Text style={[styles.addressText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>{complex.address}</Text>
            </View>
            <View style={styles.hoursRow}>
              <Ionicons name="time-outline" size={14} color={Colors.primary} />
              <Text style={[styles.hoursText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{complex.openHour}:00 - {complex.closeHour}:00</Text>
            </View>
          </View>
        </FadeInView>

        {/* Amenities */}
        <FadeInView type="fadeInDown" duration={400} delay={100}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Servicios</Text>
          <View style={styles.amenitiesGrid}>
            {complex.amenities.map((amenity) => (
              <GlassCard key={amenity} style={styles.amenityCard} padding={10}>
                <View style={styles.amenityRow}>
                  <View style={[styles.amenityIcon, { backgroundColor: Colors.primaryBg }]}>
                    <Ionicons name={(amenityIcons[amenity] || 'checkmark-circle-outline') as any} size={16} color={Colors.primary} />
                  </View>
                  <Text style={[styles.amenityText, { color: isDark ? Colors.textDark : Colors.text }]}>{amenity}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        </FadeInView>

        {/* Courts */}
        <FadeInView type="fadeInDown" duration={400} delay={200}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Canchas</Text>
          {complex.courts.map((court) => (
            <GlassCard key={court.id} style={styles.courtCard} padding={12}>
              <Image source={{ uri: court.image }} style={styles.courtImage} contentFit="cover" />
              <View style={styles.courtInfo}>
                <Text style={[styles.courtName, { color: isDark ? Colors.textDark : Colors.text }]}>{court.name}</Text>
                <View style={styles.courtDetails}>
                  <View style={[styles.courtBadge, { backgroundColor: Colors.primaryBg }]}>
                    <Text style={styles.courtBadgeText}>{getCourtTypeLabel(court.type)}</Text>
                  </View>
                  <Text style={[styles.courtSurface, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{court.surface}</Text>
                </View>
                <View style={styles.courtMeta}>
                  <Ionicons name="people-outline" size={13} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                  <Text style={[styles.courtMetaText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>{court.capacity} personas</Text>
                </View>
                <View style={styles.courtBottom}>
                  <Text style={styles.courtPrice}>{formatPrice(court.pricePerHour)}/h</Text>
                  <TouchableOpacity style={styles.reserveButton} onPress={() => handleReserve(court.id)} activeOpacity={0.8}>
                    <Text style={styles.reserveButtonText}>Reservar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}
        </FadeInView>

        {/* Map Preview */}
        <FadeInView type="fadeInDown" duration={400} delay={300}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Ubicación</Text>
          <GlassCard style={styles.mapPreviewCard} padding={0}>
            <View style={styles.mapPreviewPlaceholder}>
              <View style={styles.mapPinContainer}>
                <Ionicons name="location" size={28} color={Colors.primary} />
              </View>
              <View style={styles.mapAddressOverlay}>
                <Text style={styles.mapAddressText}>{complex.address}</Text>
              </View>
            </View>
          </GlassCard>
        </FadeInView>

        {/* Reviews */}
        <FadeInView type="fadeInDown" duration={400} delay={350}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Reseñas</Text>
            {reviews.length > 0 && (
              <View style={styles.avgRatingBox}>
                <Ionicons name="star" size={14} color={Colors.star} />
                <Text style={styles.avgRatingText}>{avgRating}</Text>
                <Text style={[styles.reviewCount, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>({reviews.length})</Text>
              </View>
            )}
          </View>
          {reviews.length === 0 ? (
            <GlassCard style={styles.noReviewsCard} padding={16}>
              <Text style={[styles.noReviewsText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Aún no hay reseñas</Text>
            </GlassCard>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <GlassCard key={review.id} style={styles.reviewCard} padding={12}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.userAvatar }} style={styles.reviewAvatar} contentFit="cover" />
                  <View style={styles.reviewHeaderInfo}>
                    <Text style={[styles.reviewUserName, { color: isDark ? Colors.textDark : Colors.text }]}>{review.userName}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={12} color={Colors.star} />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewDate, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>{review.date}</Text>
                </View>
                <Text style={[styles.reviewComment, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{review.comment}</Text>
              </GlassCard>
            ))
          )}
        </FadeInView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: 8, marginTop: 8 },
  backBtnText: { color: '#111', fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  heroContainer: { position: 'relative', height: 260 },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.3)' },
  heroButton: { position: 'absolute', width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  imageCounter: { position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' },
  imageCounterText: { color: '#FFF', fontSize: 12, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  galleryScroll: { paddingHorizontal: 16, marginTop: -24, marginBottom: 8 },
  galleryThumb: { width: 56, height: 56, borderRadius: 10, overflow: 'hidden', marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  galleryImage: { width: '100%', height: '100%' },
  infoSection: { paddingHorizontal: 16, marginBottom: 16, gap: 6 },
  complexName: { fontSize: 22, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ratingText: { fontSize: 14, fontWeight: '800', color: Colors.star },
  districtRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  districtText: { fontSize: 13 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressText: { fontSize: 12 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hoursText: { fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10, paddingHorizontal: 16 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  amenityCard: { width: (SCREEN_WIDTH - 40) / 2 - 4 },
  amenityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amenityIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  amenityText: { fontSize: 12, fontWeight: '600', flex: 1 },
  courtCard: { marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', gap: 10, overflow: 'hidden' },
  courtImage: { width: 80, height: 90, borderRadius: 8 },
  courtInfo: { flex: 1, gap: 4 },
  courtName: { fontSize: 14, fontWeight: '700' },
  courtDetails: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  courtBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  courtBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.primaryDark },
  courtSurface: { fontSize: 11 },
  courtMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  courtMetaText: { fontSize: 11 },
  courtBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  courtPrice: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  reserveButton: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  reserveButtonText: { color: '#111', fontWeight: '700', fontSize: 12 },
  mapPreviewCard: { marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' },
  mapPreviewPlaceholder: { height: 140, backgroundColor: '#E8F5E9', position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  mapPinContainer: { alignItems: 'center' },
  mapAddressOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 6, paddingHorizontal: 10 },
  mapAddressText: { color: '#FFF', fontSize: 11, fontWeight: '500' },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  avgRatingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avgRatingText: { fontSize: 14, fontWeight: '800', color: Colors.star },
  reviewCount: { fontSize: 12 },
  noReviewsCard: { marginHorizontal: 16, marginBottom: 16 },
  noReviewsText: { textAlign: 'center', fontSize: 13 },
  reviewCard: { marginHorizontal: 16, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16 },
  reviewHeaderInfo: { flex: 1, gap: 2 },
  reviewUserName: { fontSize: 13, fontWeight: '700' },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewDate: { fontSize: 10 },
  reviewComment: { fontSize: 12, lineHeight: 18, marginTop: 6 },
});
