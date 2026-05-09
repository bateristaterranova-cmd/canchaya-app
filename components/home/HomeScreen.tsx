import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAppStore } from '@/lib/store';
import {
  mockComplexes,
  getComplexById,
  getCourtTypeLabel,
  formatPrice,
  type Complex,
} from '@/lib/mock-data';
import { Colors, NeonShadows, GlassShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';

// ─── Sport Type Filter Config ────────────────────────────────────────────────
const SPORT_TYPES = [
  { key: 'all', label: 'Todos', icon: '🏆' },
  { key: 'futbol5', label: 'Fútbol 5', icon: '⚽' },
  { key: 'futbol7', label: 'Fútbol 7', icon: '⚽' },
  { key: 'futbol11', label: 'Fútbol 11', icon: '⚽' },
  { key: 'padel', label: 'Pádel', icon: '🎾' },
];

// ─── Unique Districts ────────────────────────────────────────────────────────
const ALL_DISTRICTS = ['Todos', ...Array.from(new Set(mockComplexes.map((c) => c.district)))];

// ─── Sort Config ─────────────────────────────────────────────────────────────
type SortKey = 'popular' | 'precio' | 'cerca';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'precio', label: 'Precio' },
  { key: 'cerca', label: 'Cerca' },
];

// ─── Animated Venue Card ─────────────────────────────────────────────────────
function VenueCard({
  complex,
  isFavorite,
  onToggleFavorite,
  isDark,
}: {
  complex: Complex;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleHeartPressIn = () => {
    heartScale.value = withSpring(1.3, { damping: 10, stiffness: 400 });
  };

  const handleHeartPressOut = () => {
    heartScale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  // Get unique court types for badges
  const courtTypes = Array.from(new Set(complex.courts.map((c) => c.type)));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/complex/${complex.id}`)}
        style={styles.venueCardPressable}
      >
        <GlassCard
          isDark={isDark}
          style={styles.venueCard}
        >
          {/* Image Section */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: complex.image }}
              style={styles.venueImage}
              contentFit="cover"
              transition={200}
            />

            {/* Rating Badge - Top Left */}
            <View style={[styles.ratingBadge, isDark && styles.ratingBadgeDark]}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={[styles.ratingText, isDark && styles.ratingTextDark]}>
                {complex.rating}
              </Text>
            </View>

            {/* Heart Favorite Button - Top Right */}
            <Animated.View style={heartAnimatedStyle}>
              <Pressable
                onPressIn={handleHeartPressIn}
                onPressOut={handleHeartPressOut}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                style={[styles.heartButton, isDark && styles.heartButtonDark]}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorite ? '#EF4444' : isDark ? '#94A3B8' : '#64748B'}
                />
              </Pressable>
            </Animated.View>
          </View>

          {/* Content Section */}
          <View style={styles.venueContent}>
            {/* Complex Name */}
            <Text
              style={[styles.venueName, isDark && styles.venueNameDark]}
              numberOfLines={1}
            >
              {complex.name}
            </Text>

            {/* District with MapPin */}
            <View style={styles.districtRow}>
              <Ionicons name="location" size={13} color={Colors.neonGreen} />
              <Text style={[styles.districtText, isDark && styles.districtTextDark]} numberOfLines={1}>
                {complex.district}
              </Text>
            </View>

            {/* Court Type Badges + Price */}
            <View style={styles.badgesPriceRow}>
              <View style={styles.badgesContainer}>
                {courtTypes.slice(0, 3).map((type) => (
                  <View
                    key={type}
                    style={[styles.courtBadge, isDark && styles.courtBadgeDark]}
                  >
                    <Text style={[styles.courtBadgeText, isDark && styles.courtBadgeTextDark]}>
                      {getCourtTypeLabel(type)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.priceText}>
                {formatPrice(complex.minPrice)}
                <Text style={styles.priceHour}>/h</Text>
              </Text>
            </View>

            {/* Ver cancha link */}
            <TouchableOpacity
              onPress={() => router.push(`/complex/${complex.id}`)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.verCanchaRow}>
                <Text style={styles.verCanchaText}>Ver cancha</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.neonGreen} />
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

// ─── Filter Pill Component ───────────────────────────────────────────────────
function FilterPill({
  label,
  icon,
  isActive,
  isDark,
  onPress,
  size = 'md',
}: {
  label: string;
  icon?: string;
  isActive: boolean;
  isDark: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        onPress={onPress}
        style={[
          styles.filterPill,
          size === 'sm' && styles.filterPillSmall,
          isActive
            ? styles.filterPillActive
            : isDark
            ? styles.filterPillInactiveDark
            : styles.filterPillInactive,
        ]}
      >
        {icon ? (
          <Text style={styles.filterPillIcon}>{icon}</Text>
        ) : null}
        <Text
          style={[
            styles.filterPillText,
            size === 'sm' && styles.filterPillTextSmall,
            isActive
              ? styles.filterPillTextActive
              : isDark
              ? styles.filterPillTextInactiveDark
              : styles.filterPillTextInactive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main HomeScreen ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  // Store
  const user = useAppStore((s) => s.user);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const unreadNotificationCount = useAppStore((s) => s.unreadNotificationCount);
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('Todos');
  const [sortBy, setSortBy] = useState<SortKey>('popular');

  // Filtered complexes
  const filteredComplexes = useMemo(() => {
    let result = [...mockComplexes];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    // Sport type filter
    if (selectedSport !== 'all') {
      result = result.filter((c) =>
        c.courts.some((court) => court.type === selectedSport)
      );
    }

    // District filter
    if (selectedDistrict !== 'Todos') {
      result = result.filter((c) => c.district === selectedDistrict);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'precio':
        result.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'cerca':
        // Keep original order (distance would need geolocation)
        break;
    }

    return result;
  }, [searchQuery, selectedSport, selectedDistrict, sortBy]);

  const firstName = user?.name?.split(' ')[0] || 'Usuario';

  // ─── List Header Component ──────────────────────────────────────────────
  const ListHeader = useMemo(
    () => (
      <View style={styles.listHeaderContainer}>
        {/* ── 1. Header ────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, isDarkMode && styles.greetingDark]}>
              Hola, {firstName} 👋
            </Text>
            <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
              ¿Listo para jugar?
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* Notification Bell */}
            <TouchableOpacity
              onPress={() => console.log('Bell pressed')}
              style={[styles.bellButton, isDarkMode && styles.bellButtonDark]}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={isDarkMode ? '#F1F5F9' : '#334155'}
              />
              {unreadNotificationCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Avatar */}
            <View style={styles.avatarRing}>
              <Image
                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
            </View>
          </View>
        </View>

        {/* ── 2. Search Bar ────────────────────────────────────────── */}
        <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
          <Ionicons
            name="search-outline"
            size={20}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
            placeholder="Buscar canchas, distritos..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterIconButton}>
            <Ionicons
              name="options-outline"
              size={20}
              color={isDarkMode ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        {/* ── 3. Sport Type Filter Pills ───────────────────────────── */}
        <View style={styles.pillSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SPORT_TYPES}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <FilterPill
                label={item.label}
                icon={item.icon}
                isActive={selectedSport === item.key}
                isDark={isDarkMode}
                onPress={() => setSelectedSport(item.key)}
                size="md"
              />
            )}
            contentContainerStyle={styles.pillListContent}
          />
        </View>

        {/* ── 4. District Filter Pills ─────────────────────────────── */}
        <View style={styles.pillSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={ALL_DISTRICTS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <FilterPill
                label={item}
                isActive={selectedDistrict === item}
                isDark={isDarkMode}
                onPress={() => setSelectedDistrict(item)}
                size="sm"
              />
            )}
            contentContainerStyle={styles.pillListContent}
          />
        </View>

        {/* ── 5. "Canchas cerca de ti" Section Title ──────────────── */}
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionTitleLeft}>
            <Ionicons name="location" size={18} color={Colors.neonGreen} />
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              Canchas cerca de ti
            </Text>
          </View>
          <View style={styles.sortButtonsRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === opt.key && styles.sortButtonTextActive,
                    isDarkMode && !sortBy !== opt.key && styles.sortButtonTextDark,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    ),
    [
      firstName,
      isDarkMode,
      searchQuery,
      selectedSport,
      selectedDistrict,
      sortBy,
      unreadNotificationCount,
      user?.avatar,
    ]
  );

  // ─── Empty State ─────────────────────────────────────────────────────
  const EmptyState = useMemo(
    () => (
      <View style={styles.emptyStateContainer}>
        <View style={[styles.emptyIconCircle, isDarkMode && styles.emptyIconCircleDark]}>
          <Ionicons name="search-outline" size={40} color={isDarkMode ? '#64748B' : '#94A3B8'} />
        </View>
        <Text style={[styles.emptyTitle, isDarkMode && styles.emptyTitleDark]}>
          No se encontraron canchas
        </Text>
        <Text style={[styles.emptySubtitle, isDarkMode && styles.emptySubtitleDark]}>
          Intenta con otros filtros o busca algo diferente
        </Text>
        <NeonButton
          title="Ver todas las canchas"
          onPress={() => {
            setSearchQuery('');
            setSelectedSport('all');
            setSelectedDistrict('Todos');
          }}
          variant="outline"
          size="md"
        />
      </View>
    ),
    [isDarkMode]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}
      edges={['top']}
    >
      <FlatList
        data={filteredComplexes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VenueCard
            complex={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            isDark={isDarkMode}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeAreaDark: {
    backgroundColor: '#0F172A',
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // pb-24 equivalent for tab bar clearance
  },

  // ── List Header ─────────────────────────────────────────────────────
  listHeaderContainer: {
    gap: 16,
    marginBottom: 8,
  },

  // ── Header ──────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  greetingDark: {
    color: '#F1F5F9',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  subtitleDark: {
    color: '#94A3B8',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellButtonDark: {
    backgroundColor: 'rgba(30,41,59,0.7)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: Colors.neonGreen,
    padding: 2,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  // ── Search Bar ──────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchContainerDark: {
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  searchInputDark: {
    color: '#F1F5F9',
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(57,255,20,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Filter Pills ────────────────────────────────────────────────────
  pillSection: {
    marginHorizontal: -16, // allow edge-to-edge scrolling
  },
  pillListContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  filterPillSmall: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  filterPillActive: {
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  filterPillInactive: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  filterPillInactiveDark: {
    backgroundColor: 'rgba(30,41,59,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterPillIcon: {
    fontSize: 14,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterPillTextSmall: {
    fontSize: 12,
  },
  filterPillTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  filterPillTextInactive: {
    color: '#64748B',
  },
  filterPillTextInactiveDark: {
    color: '#94A3B8',
  },

  // ── Section Title ───────────────────────────────────────────────────
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionTitleDark: {
    color: '#F1F5F9',
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  sortButtonTextActive: {
    color: Colors.neonGreen,
    fontWeight: '700',
  },
  sortButtonTextDark: {
    color: '#64748B',
  },

  // ── Venue Card ──────────────────────────────────────────────────────
  venueCardPressable: {
    marginBottom: 16,
  },
  venueCard: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  venueImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeDark: {
    backgroundColor: 'rgba(30,41,59,0.85)',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  ratingTextDark: {
    color: '#F1F5F9',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonDark: {
    backgroundColor: 'rgba(30,41,59,0.85)',
  },
  venueContent: {
    padding: 14,
    gap: 6,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  venueNameDark: {
    color: '#F1F5F9',
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  districtText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  districtTextDark: {
    color: '#94A3B8',
  },
  badgesPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  courtBadge: {
    backgroundColor: 'rgba(57,255,20,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  courtBadgeDark: {
    backgroundColor: 'rgba(57,255,20,0.15)',
  },
  courtBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neonGreenDark,
  },
  courtBadgeTextDark: {
    color: Colors.neonGreenLight,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neonGreen,
    marginLeft: 8,
  },
  priceHour: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  verCanchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verCanchaText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neonGreen,
  },

  // ── Empty State ─────────────────────────────────────────────────────
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(148,163,184,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyIconCircleDark: {
    backgroundColor: 'rgba(100,116,139,0.15)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyTitleDark: {
    color: '#F1F5F9',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitleDark: {
    color: '#94A3B8',
  },
});
