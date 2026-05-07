import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import {
  mockComplexes,
  promotionalBanners,
  districts,
  sportTypes,
  formatPrice,
  getComplexById,
  getCourtTypeLabel,
} from '../../lib/mock-data';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

// ========================
// Auth Screen (inline)
// ========================
function AuthScreen() {
  const { isDarkMode, login } = useAppStore();
  const isDark = isDarkMode;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const particle1Y = useSharedValue(0);
  const particle1X = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle2X = useSharedValue(0);
  const particle3Y = useSharedValue(0);
  const particle3X = useSharedValue(0);

  useEffect(() => {
    particle1Y.value = withRepeat(withTiming(-30, { duration: 3000 }), -1, true);
    particle1X.value = withRepeat(withTiming(20, { duration: 4000 }), -1, true);
    particle2Y.value = withRepeat(withTiming(25, { duration: 3500 }), -1, true);
    particle2X.value = withRepeat(withTiming(-15, { duration: 4500 }), -1, true);
    particle3Y.value = withRepeat(withTiming(-20, { duration: 2800 }), -1, true);
    particle3X.value = withRepeat(withTiming(25, { duration: 3800 }), -1, true);
  }, []);

  const p1Style = useAnimatedStyle(() => ({ transform: [{ translateX: particle1X.value }, { translateY: particle1Y.value }] }));
  const p2Style = useAnimatedStyle(() => ({ transform: [{ translateX: particle2X.value }, { translateY: particle2Y.value }] }));
  const p3Style = useAnimatedStyle(() => ({ transform: [{ translateX: particle3X.value }, { translateY: particle3Y.value }] }));

  const handleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowWelcome(true);
      setTimeout(() => {
        login({
          id: 'user-1',
          name: name || 'Carlos Mendoza',
          email: email || 'carlos@email.com',
          phone: '+51 999 888 777',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        });
        setShowWelcome(false);
      }, 1800);
    }, 1200);
  };

  if (showWelcome) {
    return (
      <View style={[styles.authContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.welcomeOverlay}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.welcomeCheck}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(500)}>
            <Text style={[styles.welcomeTitle, { color: isDark ? Colors.textDark : Colors.text }]}>
              ¡Bienvenido!
            </Text>
            <Text style={[styles.welcomeSub, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              {name || 'Carlos Mendoza'}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.authContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      {/* Floating particles */}
      <Animated.View style={[styles.particle, { top: '15%', left: '10%', width: 120, height: 120, backgroundColor: 'rgba(132,204,22,0.15)' }, p1Style]} />
      <Animated.View style={[styles.particle, { top: '40%', right: '5%', width: 100, height: 100, backgroundColor: 'rgba(59,130,246,0.12)' }, p2Style]} />
      <Animated.View style={[styles.particle, { bottom: '25%', left: '20%', width: 90, height: 90, backgroundColor: 'rgba(168,85,247,0.12)' }, p3Style]} />

      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(500)} style={styles.authContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: Colors.primary }]}>
              <Ionicons name="football" size={32} color="#111" />
            </View>
          </View>
          <Text style={[styles.authTitle, { color: isDark ? Colors.textDark : Colors.text }]}>CanchaYa</Text>
          <Text style={[styles.authSubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
            Tu cancha, tu partida
          </Text>

          {/* Tab toggle */}
          <View style={[styles.authTabContainer, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }]}>
            <TouchableOpacity
              style={[styles.authTab, isLogin && { backgroundColor: Colors.primary }]}
              onPress={() => setIsLogin(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.authTabText, isLogin && { color: '#111', fontWeight: '700' }]}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authTab, !isLogin && { backgroundColor: Colors.primary }]}
              onPress={() => setIsLogin(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.authTabText, !isLogin && { color: '#111', fontWeight: '700' }]}>Registrarse</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.authForm}>
            {!isLogin && (
              <GlassCard style={styles.inputCard}>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={Colors.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: isDark ? Colors.textDark : Colors.text }]}
                    placeholder="Nombre completo"
                    placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </GlassCard>
            )}

            <GlassCard style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: isDark ? Colors.textDark : Colors.text }]}
                  placeholder="Correo electrónico"
                  placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.inputCard}>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: isDark ? Colors.textDark : Colors.text }]}
                  placeholder="Contraseña"
                  placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </GlassCard>

            {!isLogin && (
              <GlassCard style={styles.inputCard}>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: isDark ? Colors.textDark : Colors.text }]}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </GlassCard>
            )}

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.authButtonText}>
                {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            {/* Google sign-in */}
            <TouchableOpacity style={[styles.googleButton, { borderColor: isDark ? Colors.borderDark : Colors.border }]} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color={isDark ? Colors.textDark : Colors.text} />
              <Text style={[styles.googleButtonText, { color: isDark ? Colors.textDark : Colors.text }]}>
                Continuar con Google
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ========================
// Venue Card
// ========================
function VenueCard({ complex, isFav, onToggleFav, onPress }: {
  complex: any;
  isFav: boolean;
  onToggleFav: () => void;
  onPress: () => void;
}) {
  const { isDarkMode } = useAppStore();
  const isDark = isDarkMode;
  const scale = useSharedValue(1);
  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const courtTypes = Array.from(new Set(complex.courts.map((c: any) => c.type))) as string[];

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)} style={cardAnimStyle}>
      <GlassCard padding={0} style={styles.venueCard}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
          {/* Image */}
          <View style={styles.venueImageContainer}>
            <Image source={{ uri: complex.image }} style={styles.venueImage} contentFit="cover" />
            {/* Heart */}
            <TouchableOpacity style={styles.venueHeart} onPress={onToggleFav} activeOpacity={0.7}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? Colors.heart : '#FFF'} />
            </TouchableOpacity>
            {/* Rating */}
            <View style={[styles.venueRating, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)' }]}>
              <Ionicons name="star" size={12} color={Colors.star} />
              <Text style={[styles.venueRatingText, { color: isDark ? Colors.textDark : Colors.text }]}>{complex.rating}</Text>
            </View>
          </View>
          {/* Content */}
          <View style={styles.venueContent}>
            <Text style={[styles.venueName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{complex.name}</Text>
            <View style={styles.venueDistrictRow}>
              <Ionicons name="location-outline" size={13} color={Colors.primary} />
              <Text style={[styles.venueDistrict, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>{complex.district}</Text>
            </View>
            <View style={styles.venueBadgesRow}>
              {courtTypes.map((type: string) => (
                <View key={type} style={styles.courtBadge}>
                  <Text style={styles.courtBadgeText}>{getCourtTypeLabel(type)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.venueBottomRow}>
              <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <Text style={styles.venueLink}>Ver cancha →</Text>
              </TouchableOpacity>
              <Text style={styles.venuePrice}>{formatPrice(complex.minPrice)}/h</Text>
            </View>
          </View>
        </TouchableOpacity>
      </GlassCard>
    </Animated.View>
  );
}

// ========================
// Home Screen
// ========================
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    isDarkMode, isAuthenticated, user, searchQuery, setSearchQuery,
    favorites, toggleFavorite, selectComplex, unreadNotificationCount,
    markAllNotificationsRead, recentlyViewed,
  } = useAppStore();
  const isDark = isDarkMode;

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Todos');
  const [selectedSport, setSelectedSport] = useState('todos');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'near'>('popular');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Banner auto-scroll
  const bannerRef = useRef<FlatList>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (bannerIndex + 1) % promotionalBanners.length;
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
      setBannerIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerIndex]);

  // Filtered complexes
  const filteredComplexes = useMemo(() => {
    let result = [...mockComplexes];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.courts.some(court => getCourtTypeLabel(court.type).toLowerCase().includes(q))
      );
    }

    // District
    if (selectedDistrict !== 'Todos') {
      result = result.filter(c => c.district === selectedDistrict);
    }

    // Sport
    if (selectedSport !== 'todos') {
      result = result.filter(c => c.courts.some(court => court.type === selectedSport));
    }

    // Favorites
    if (showFavoritesOnly) {
      result = result.filter(c => favorites.includes(c.id));
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      result.sort((a, b) => a.minPrice - b.minPrice);
    }

    return result;
  }, [searchQuery, selectedDistrict, selectedSport, showFavoritesOnly, sortBy, favorites]);

  const recentlyViewedComplexes = useMemo(() => {
    return recentlyViewed.map(id => getComplexById(id)).filter(Boolean);
  }, [recentlyViewed]);

  const handleComplexPress = useCallback((id: string) => {
    selectComplex(id);
    router.push('/detail');
  }, [selectComplex, router]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const firstName = user?.name?.split(' ')[0] || 'Usuario';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: isDark ? Colors.textDark : Colors.text }]}>
              Hola, {firstName} 👋
            </Text>
            <Text style={[styles.subGreeting, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              ¿Listo para jugar?
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationBell}
              onPress={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markAllNotificationsRead();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={isDark ? Colors.textDark : Colors.text} />
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.avatarRing}>
              <Image source={{ uri: user?.avatar }} style={styles.headerAvatar} contentFit="cover" />
            </View>
          </View>
        </Animated.View>

        {/* Promo Banner */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={styles.bannerContainer}>
            <FlatList
              ref={bannerRef}
              data={promotionalBanners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
                setBannerIndex(idx);
              }}
              renderItem={({ item }) => (
                <GlassCard style={[styles.bannerCard, { width: BANNER_WIDTH }]} padding={0}>
                  <View style={[styles.bannerInner, { backgroundColor: item.gradient[0] }]}>
                    <View style={styles.bannerDecor1} />
                    <View style={styles.bannerDecor2} />
                    <Text style={styles.bannerEmoji}>{item.emoji}</Text>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <TouchableOpacity style={styles.bannerButton} activeOpacity={0.8}>
                      <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              )}
            />
            {/* Dots */}
            <View style={styles.bannerDots}>
              {promotionalBanners.map((_, i) => (
                <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <GlassCard style={styles.searchCard}>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? Colors.textDark : Colors.text }]}
                placeholder="Buscar canchas, distritos..."
                placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowFilters(!showFilters)} activeOpacity={0.7}>
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={showFilters ? Colors.primary : (isDark ? Colors.textTertiaryDark : Colors.textTertiary)}
                />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* District pills */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
            {districts.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.pill,
                  selectedDistrict === d
                    ? { backgroundColor: Colors.primary }
                    : { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface, borderColor: isDark ? Colors.borderDark : Colors.border },
                ]}
                onPress={() => setSelectedDistrict(d)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, selectedDistrict === d && { color: '#111', fontWeight: '700' }]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Sport type pills (when filter open) */}
        {showFilters && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              {sportTypes.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.pill,
                    selectedSport === s.id
                      ? { backgroundColor: Colors.primary }
                      : { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface, borderColor: isDark ? Colors.borderDark : Colors.border },
                  ]}
                  onPress={() => setSelectedSport(s.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, selectedSport === s.id && { color: '#111', fontWeight: '700' }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Recently Viewed */}
        {recentlyViewedComplexes.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitleSecondary, { color: isDark ? Colors.textDark : Colors.text }]}>Vistos recientemente</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentlyScroll}>
              {recentlyViewedComplexes.map((complex: any) => (
                <TouchableOpacity
                  key={complex.id}
                  onPress={() => handleComplexPress(complex.id)}
                  activeOpacity={0.8}
                >
                  <GlassCard style={styles.recentlyCard} padding={8}>
                    <Image source={{ uri: complex.image }} style={styles.recentlyImage} contentFit="cover" />
                    <Text style={[styles.recentlyName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{complex.name}</Text>
                    <Text style={styles.recentlyPrice}>{formatPrice(complex.minPrice)}/h</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Section title + sort */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleAccent} />
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Canchas cerca de ti</Text>
          </View>
          <View style={styles.sortRow}>
            {(['popular', 'price', 'near'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSortBy(s)}
                activeOpacity={0.7}
                style={[styles.sortBtn, sortBy === s && styles.sortBtnActive]}
              >
                <Text style={[styles.sortBtnText, sortBy === s && styles.sortBtnTextActive]}>
                  {s === 'popular' ? 'Popular' : s === 'price' ? 'Precio' : 'Cerca'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Favorites toggle */}
        <TouchableOpacity
          style={[styles.favToggle, { borderColor: isDark ? Colors.borderDark : Colors.border }, showFavoritesOnly && styles.favToggleActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          activeOpacity={0.7}
        >
          <Ionicons name={showFavoritesOnly ? 'heart' : 'heart-outline'} size={16} color={showFavoritesOnly ? Colors.heart : (isDark ? Colors.textSecondaryDark : Colors.textSecondary)} />
          <Text style={[styles.favToggleText, showFavoritesOnly && { color: Colors.heart }]}>Solo favoritos</Text>
        </TouchableOpacity>

        {/* Venue cards or empty */}
        {filteredComplexes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }]}>
              <Ionicons name="search-outline" size={40} color={Colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.textDark : Colors.text }]}>No se encontraron canchas</Text>
            <Text style={[styles.emptySub, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              Intenta con otros filtros o busca algo diferente
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => { setSearchQuery(''); setSelectedDistrict('Todos'); setSelectedSport('todos'); setShowFavoritesOnly(false); }}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Ver todas las canchas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredComplexes.map((complex) => (
            <VenueCard
              key={complex.id}
              complex={complex}
              isFav={favorites.includes(complex.id)}
              onToggleFav={() => toggleFavorite(complex.id)}
              onPress={() => handleComplexPress(complex.id)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },

  // Auth
  authContainer: { flex: 1 },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  authContent: { alignItems: 'center' },
  particle: { position: 'absolute', borderRadius: 999 },
  logoContainer: { marginBottom: 12 },
  logoIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  authTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  authSubtitle: { fontSize: 14, marginBottom: 24 },
  authTabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 24, width: '100%' },
  authTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  authTabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  authForm: { width: '100%', gap: 12 },
  inputCard: { padding: 0 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4, gap: 10 },
  input: { flex: 1, height: 44, fontSize: 14 },
  authButton: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  authButtonText: { color: '#111', fontWeight: '700', fontSize: 16 },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 8, gap: 8 },
  googleButtonText: { fontSize: 14, fontWeight: '600' },
  welcomeOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcomeCheck: { marginBottom: 16 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  welcomeSub: { fontSize: 16, textAlign: 'center', marginTop: 4 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 22, fontWeight: '800' },
  subGreeting: { fontSize: 14, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationBell: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(132,204,22,0.1)' },
  notificationBadge: { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  notificationBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  avatarRing: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: Colors.primary, padding: 2 },
  headerAvatar: { width: '100%', height: '100%', borderRadius: 19 },

  // Banner
  bannerContainer: { marginBottom: 16 },
  bannerCard: { overflow: 'hidden', borderRadius: 16 },
  bannerInner: { padding: 20, borderRadius: 16, overflow: 'hidden', minHeight: 130, justifyContent: 'center' },
  bannerDecor1: { position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)' },
  bannerDecor2: { position: 'absolute', bottom: -20, left: 30, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.1)' },
  bannerEmoji: { fontSize: 32, marginBottom: 6 },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 10 },
  bannerButton: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  bannerButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc' },
  dotActive: { backgroundColor: Colors.primary, width: 20 },

  // Search
  searchCard: { marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15 },

  // Pills
  pillsScroll: { marginBottom: 12, marginHorizontal: -16, paddingHorizontal: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  pillText: { fontSize: 13, fontWeight: '500', color: '#666' },

  // Recently viewed
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionTitleSecondary: { fontSize: 15, fontWeight: '600' },
  sectionTitleAccent: { width: 3, height: 18, borderRadius: 2, backgroundColor: Colors.primary, marginRight: 2 },
  recentlyScroll: { marginHorizontal: -16, paddingHorizontal: 16, marginBottom: 8 },
  recentlyCard: { width: 140, marginRight: 10 },
  recentlyImage: { width: '100%', height: 70, borderRadius: 8, marginBottom: 6 },
  recentlyName: { fontSize: 12, fontWeight: '600' },
  recentlyPrice: { fontSize: 11, fontWeight: '600', color: Colors.primary, marginTop: 2 },

  // Sort
  sortRow: { flexDirection: 'row', gap: 4 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  sortBtnActive: { borderBottomColor: Colors.primary },
  sortBtnText: { fontSize: 12, fontWeight: '500', color: '#999' },
  sortBtnTextActive: { color: Colors.primary, fontWeight: '700' },

  // Fav toggle
  favToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, backgroundColor: 'transparent', alignSelf: 'flex-start', marginBottom: 12 },
  favToggleActive: { borderColor: Colors.heart, backgroundColor: 'rgba(239,68,68,0.08)' },
  favToggleText: { fontSize: 13, fontWeight: '600', color: '#666' },

  // Venue card
  venueCard: { marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  venueImageContainer: { position: 'relative', width: '100%', aspectRatio: 16 / 9 },
  venueImage: { width: '100%', height: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  venueHeart: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  venueRating: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  venueRatingText: { fontSize: 12, fontWeight: '700' },
  venueContent: { padding: 12 },
  venueName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  venueDistrictRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  venueDistrict: { fontSize: 12 },
  venueBadgesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  courtBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(132, 204, 22, 0.12)', borderWidth: 1, borderColor: 'rgba(132, 204, 22, 0.2)' },
  courtBadgeText: { fontSize: 12, fontWeight: '600', color: '#4D7C0F' },
  venuePrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  venueLink: { fontSize: 14, fontWeight: '700', color: Colors.primary, letterSpacing: 0.3 },
  venueBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  emptyButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primary },
  emptyButtonText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
