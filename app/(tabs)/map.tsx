import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  SlideInUp,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Svg, { Circle, Path, G, Ellipse, Line, Rect } from 'react-native-svg';
import { mockComplexes } from '@/lib/mock-data';
import { Colors, GlassShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';

// ─── Pin positions (relative to map area) ────────────────────────────────────
const PIN_POSITIONS = [
  { id: 'complex-1', x: 0.55, y: 0.38, primaryType: 'futbol5' },
  { id: 'complex-2', x: 0.42, y: 0.30, primaryType: 'futbol5' },
  { id: 'complex-3', x: 0.72, y: 0.52, primaryType: 'futbol5' },
  { id: 'complex-4', x: 0.80, y: 0.35, primaryType: 'futbol11' },
  { id: 'complex-5', x: 0.50, y: 0.50, primaryType: 'futbol5' },
  { id: 'complex-6', x: 0.35, y: 0.58, primaryType: 'futbol5' },
  { id: 'complex-7', x: 0.28, y: 0.40, primaryType: 'futbol5' },
  { id: 'complex-8', x: 0.62, y: 0.44, primaryType: 'futbol5' },
];

// ─── Get primary court type for a complex ────────────────────────────────────
function getPrimaryType(complexId: string): string {
  const pin = PIN_POSITIONS.find(p => p.id === complexId);
  return pin?.primaryType || 'futbol5';
}

// ─── Sport icon SVG inside pin ───────────────────────────────────────────────
function SportIcon({ type, size = 14 }: { type: string; size?: number }) {
  const s = size;
  if (type === 'padel') {
    // Padel racket
    return (
      <G>
        {/* Racket head */}
        <Ellipse cx={s * 0.5} cy={s * 0.4} rx={s * 0.28} ry={s * 0.3} fill="white" />
        {/* Racket handle */}
        <Rect x={s * 0.38} y={s * 0.65} width={s * 0.24} height={s * 0.35} rx={2} fill="white" />
        {/* Grid lines on racket */}
        <Line x1={s * 0.28} y1={s * 0.3} x2={s * 0.72} y2={s * 0.3} stroke="#2D3748" strokeWidth={0.5} />
        <Line x1={s * 0.28} y1={s * 0.45} x2={s * 0.72} y2={s * 0.45} stroke="#2D3748" strokeWidth={0.5} />
        <Line x1={s * 0.35} y1={s * 0.15} x2={s * 0.35} y2={s * 0.65} stroke="#2D3748" strokeWidth={0.5} />
        <Line x1={s * 0.5} y1={s * 0.15} x2={s * 0.5} y2={s * 0.65} stroke="#2D3748" strokeWidth={0.5} />
        <Line x1={s * 0.65} y1={s * 0.15} x2={s * 0.65} y2={s * 0.65} stroke="#2D3748" strokeWidth={0.5} />
      </G>
    );
  }
  // Default: soccer ball for all futbol types
  return (
    <G>
      {/* Soccer ball circle */}
      <Circle cx={s * 0.5} cy={s * 0.5} r={s * 0.38} fill="white" />
      {/* Pentagon pattern */}
      <Path
        d={`M${s * 0.5} ${s * 0.2} L${s * 0.72} ${s * 0.35} L${s * 0.65} ${s * 0.6} L${s * 0.35} ${s * 0.6} L${s * 0.28} ${s * 0.35} Z`}
        fill="#1E293B"
      />
      {/* Small panels */}
      <Path d={`M${s * 0.5} ${s * 0.2} L${s * 0.5} ${s * 0.08} L${s * 0.7} ${s * 0.18} L${s * 0.72} ${s * 0.35}`} fill="#CBD5E1" />
      <Path d={`M${s * 0.28} ${s * 0.35} L${s * 0.12} ${s * 0.32} L${s * 0.15} ${s * 0.52} L${s * 0.35} ${s * 0.6}`} fill="#CBD5E1" />
      <Path d={`M${s * 0.72} ${s * 0.35} L${s * 0.88} ${s * 0.32} L${s * 0.85} ${s * 0.52} L${s * 0.65} ${s * 0.6}`} fill="#CBD5E1" />
    </G>
  );
}

// ─── Map Pin Marker (like Uber/Google Maps pin shape) ─────────────────────────
function MapPin({
  complexId,
  x,
  y,
  isSelected,
  onPress,
}: {
  complexId: string;
  x: number;
  y: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  // Hooks must be called before any conditional returns
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.4, { duration: 1500 }), withTiming(1, { duration: 1500 })),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1 - (pulseScale.value - 1) * 1.5,
  }));

  const complex = mockComplexes.find((c) => c.id === complexId);
  if (!complex) return null;

  const sportType = getPrimaryType(complexId);

  const PIN_SIZE = isSelected ? 52 : 44;
  const SVG_SIZE = PIN_SIZE;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pinContainer,
        { left: `${x * 100}%`, top: `${y * 100}%` },
      ]}
    >
      {/* Label above pin when selected */}
      {isSelected && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.pinLabel}>
          <Text style={styles.pinLabelText} numberOfLines={1}>
            {complex.name.replace('Complejo Deportivo ', '').replace('Deportivo ', '')}
          </Text>
        </Animated.View>
      )}

      {/* Pulse ring */}
      <Animated.View style={[styles.pinPulse, pulseStyle]} />

      {/* Pin SVG */}
      <Svg
        width={SVG_SIZE}
        height={SVG_SIZE * 1.3}
        viewBox="0 0 44 57"
        style={styles.pinSvg}
      >
        {/* Shadow */}
        <Ellipse cx={22} cy={54} rx={10} ry={3} fill="rgba(0,0,0,0.15)" />

        {/* Pin body - classic map pin shape */}
        <Path
          d="M22 53 C22 53 6 34 6 20 C6 10 13 3 22 3 C31 3 38 10 38 20 C38 34 22 53 22 53 Z"
          fill={isSelected ? Colors.neonGreen : '#2D3748'}
          stroke={isSelected ? Colors.neonGreenLight : '#1E293B'}
          strokeWidth={1}
        />

        {/* Inner white circle for icon */}
        <Circle
          cx={22}
          cy={19}
          r={11}
          fill={isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.92)'}
        />

        {/* Sport icon */}
        <G transform={`translate(${22 - 8}, ${19 - 8})`}>
          <SportIcon type={sportType} size={16} />
        </G>
      </Svg>
    </Pressable>
  );
}

// ─── Main Map Screen ──────────────────────────────────────────────────────────
export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const router = useRouter();

  // Get filtered complexes
  const filteredComplexes = searchQuery
    ? mockComplexes.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.district.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockComplexes;

  const selectedComplex = selectedPinId
    ? mockComplexes.find((c) => c.id === selectedPinId)
    : null;

  const handlePinPress = (id: string) => {
    setSelectedPinId(selectedPinId === id ? null : id);
  };

  const handleCloseSheet = () => {
    setSelectedPinId(null);
  };

  // ─── Center on user location ─────────────────────────────────────────────
  const centerOnLocation = useCallback(async () => {
    try {
      setIsLocating(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu ubicación para centrar el mapa.',
          [{ text: 'OK' }]
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      // Fallback: use Lima center coordinates
      setUserLocation({ latitude: -12.0464, longitude: -77.0428 });
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Get location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch {
        // Silently fail - user can manually request location
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapArea}>
        {/* Map Background - Uber-like clean style */}
        <View style={styles.mapBackground}>
          <LinearGradient
            colors={['#F0F0F0', '#E8E8E8', '#F2F2F2', '#EBEBEB']}
            style={styles.mapGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Road grid - horizontal */}
            {Array.from({ length: 14 }).map((_, i) => (
              <View
                key={`h-${i}`}
                style={[
                  styles.roadH,
                  { top: `${(i + 1) * 7}%` },
                  i % 3 === 0 && styles.roadHMajor,
                ]}
              />
            ))}

            {/* Road grid - vertical */}
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={`v-${i}`}
                style={[
                  styles.roadV,
                  { left: `${(i + 1) * 10}%` },
                  i % 2 === 0 && styles.roadVMajor,
                ]}
              />
            ))}

            {/* Diagonal avenues */}
            <View style={[styles.avenue, { top: '8%', left: '5%', width: '40%', transform: [{ rotate: '22deg' }] }]} />
            <View style={[styles.avenue, { top: '50%', left: '35%', width: '45%', transform: [{ rotate: '-12deg' }] }]} />
            <View style={[styles.avenue, { top: '25%', left: '55%', width: '35%', transform: [{ rotate: '30deg' }] }]} />

            {/* Green zones / Parks - bright green like Uber/Google Maps */}
            <View style={[styles.park, { top: '12%', left: '3%', width: 100, height: 75 }]}>
              <View style={styles.parkInner}>
                <Text style={styles.parkLabel}>Parque</Text>
              </View>
            </View>
            <View style={[styles.park, { top: '55%', left: '62%', width: 120, height: 90 }]}>
              <View style={styles.parkInner}>
                <Text style={styles.parkLabel}>Campo de Marte</Text>
              </View>
            </View>
            <View style={[styles.park, { top: '35%', left: '72%', width: 75, height: 65 }]}>
              <View style={styles.parkInner}>
                <Text style={styles.parkLabel}>Parque</Text>
              </View>
            </View>
            <View style={[styles.park, { top: '70%', left: '8%', width: 85, height: 55 }]}>
              <View style={styles.parkInner}>
                <Text style={styles.parkLabel}>Jardín</Text>
              </View>
            </View>
            <View style={[styles.park, { top: '5%', left: '50%', width: 65, height: 50 }]}>
              <View style={styles.parkInner} />
            </View>

            {/* Building blocks */}
            {[
              { top: '18%', left: '20%', w: 45, h: 35 },
              { top: '22%', left: '38%', w: 55, h: 40 },
              { top: '45%', left: '15%', w: 50, h: 30 },
              { top: '40%', left: '48%', w: 40, h: 45 },
              { top: '65%', left: '35%', w: 55, h: 35 },
              { top: '60%', left: '55%', w: 35, h: 30 },
              { top: '30%', left: '60%', w: 40, h: 25 },
              { top: '75%', left: '60%', w: 50, h: 30 },
            ].map((b, i) => (
              <View
                key={`block-${i}`}
                style={[styles.buildingBlock, { top: b.top, left: b.left, width: b.w, height: b.h }]}
              />
            ))}

            {/* Pin markers */}
            {PIN_POSITIONS.map((pin) => (
              <MapPin
                key={pin.id}
                complexId={pin.id}
                x={pin.x}
                y={pin.y}
                isSelected={selectedPinId === pin.id}
                onPress={() => handlePinPress(pin.id)}
              />
            ))}

            {/* User location indicator */}
            {userLocation && (
              <View style={[styles.userLocationDot, { top: '48%', left: '48%' }]}>
                <View style={styles.userLocationPulse} />
                <View style={styles.userLocationCenter} />
                <View style={styles.userLocationRing} />
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Search bar overlay */}
        <View style={styles.searchOverlay}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar complejos..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Center on my location button */}
        <Pressable
          style={styles.locationButton}
          onPress={centerOnLocation}
          disabled={isLocating}
        >
          <Ionicons
            name={isLocating ? 'refresh' : 'locate'}
            size={24}
            color={isLocating ? '#94A3B8' : '#1E293B'}
          />
        </Pressable>

        {/* Results count */}
        <View style={styles.resultsOverlay}>
          <GlassCard style={styles.resultsCard}>
            <Text style={styles.resultsText}>
              {filteredComplexes.length} complejos cerca
            </Text>
          </GlassCard>
        </View>
      </View>

      {/* Bottom Sheet */}
      {selectedComplex && (
        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.springify().damping(15)}
          style={styles.bottomSheet}
        >
          <GlassCard style={styles.sheetCard}>
            {/* Handle bar */}
            <View style={styles.sheetHandle} />

            <View style={styles.sheetRow}>
              <Image
                source={{ uri: selectedComplex.image }}
                style={styles.sheetImage}
                contentFit="cover"
              />
              <View style={styles.sheetInfo}>
                <Text style={styles.sheetName} numberOfLines={1}>
                  {selectedComplex.name}
                </Text>
                <View style={styles.sheetDistrictRow}>
                  <Ionicons name="location" size={14} color={Colors.neonGreen} />
                  <Text style={styles.sheetDistrict}>{selectedComplex.district}</Text>
                </View>
                <View style={styles.sheetMetaRow}>
                  <View style={styles.sheetRating}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.sheetRatingText}>{selectedComplex.rating}</Text>
                  </View>
                  {/* Court type badges instead of price */}
                  <View style={styles.sheetTypeBadges}>
                    {Array.from(new Set(selectedComplex.courts.map(c => c.type)))
                      .slice(0, 2)
                      .map((type) => (
                        <View key={type} style={styles.typeBadge}>
                          <Text style={styles.typeBadgeText}>
                            {type === 'futbol5' ? '⚽ F5' : type === 'futbol7' ? '⚽ F7' : type === 'futbol11' ? '⚽ F11' : '🎾 Pádel'}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.sheetButtons}>
              <View style={{ flex: 2 }}>
                <NeonButton
                  title="Ver cancha"
                  onPress={() => router.push(`/complex/${selectedComplex.id}`)}
                  size="md"
                />
              </View>
              <Pressable onPress={handleCloseSheet} style={styles.sheetCloseBtn}>
                <Text style={styles.sheetCloseText}>Cerrar</Text>
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  mapGradient: {
    flex: 1,
    position: 'relative',
  },

  // ── Roads ──────────────────────────────────────────────────────────────
  roadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  roadHMajor: {
    height: 3,
    backgroundColor: '#FFFFFF',
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#FFFFFF',
  },
  roadVMajor: {
    width: 3,
    backgroundColor: '#FFFFFF',
  },
  avenue: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  // ── Parks / Green zones ────────────────────────────────────────────────
  park: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: '#A8D5A2', // Bright visible green like Uber maps
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  parkInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(200,230,201,0.3)',
  },
  parkLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#4CAF50',
  },

  // ── Building blocks ────────────────────────────────────────────────────
  buildingBlock: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: '#DADADA',
    borderWidth: 0.5,
    borderColor: '#CCCCCC',
  },

  // ── Pin marker ─────────────────────────────────────────────────────────
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
    // Offset to center pin tip on exact position
    marginLeft: -22,
    marginTop: -57,
  },
  pinSvg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  pinPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(57,255,20,0.12)',
    top: 5,
    left: -3,
  },
  pinLabel: {
    position: 'absolute',
    bottom: 62,
    backgroundColor: 'rgba(15,23,42,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 80,
    maxWidth: 160,
  },
  pinLabelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── User location ──────────────────────────────────────────────────────
  userLocationDot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.12)',
  },
  userLocationRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#3B82F6',
  },
  userLocationCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // ── Search overlay ─────────────────────────────────────────────────────
  searchOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...GlassShadows.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 10,
  },

  // ── Location button ────────────────────────────────────────────────────
  locationButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // ── Results overlay ────────────────────────────────────────────────────
  resultsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    zIndex: 20,
  },
  resultsCard: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  // ── Bottom sheet ───────────────────────────────────────────────────────
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 0,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  sheetImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  sheetInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  sheetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sheetDistrictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetDistrict: {
    fontSize: 13,
    color: '#64748B',
  },
  sheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  sheetRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sheetRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  sheetTypeBadges: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: 'rgba(57,255,20,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neonGreenDark,
  },
  sheetButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sheetCloseBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sheetCloseText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
});
