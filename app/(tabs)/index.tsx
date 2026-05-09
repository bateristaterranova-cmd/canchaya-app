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
  Modal,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  Animated as RNAnimated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInView } from '../../components/FadeInView';

import { useAppStore } from '../../lib/store';
import {
  mockComplexes,
  promotionalBanners,
  districts,
  sportTypes,
  popularCategories,
  formatPrice,
  getComplexById,
  getCourtTypeLabel,
  mockNotifications,
  formatNotificationTime,
} from '../../lib/mock-data';
import { Colors } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

const LOGIN_BG = 'https://images.unsplash.com/photo-1546608235-3310a2494cdf?q=80&w=938&auto=format&fit=crop';

// ========================
// Auth Screen
// ========================
function AuthScreen() {
  const { isDarkMode, login } = useAppStore();
  const isDark = isDarkMode;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleAuth = useCallback(() => {
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
    }, 1000);
  }, [name, email, login]);

  return (
    <View style={styles.authContainer}>
      <Image source={{ uri: LOGIN_BG }} style={styles.authBgImage} contentFit="cover" />
      <View style={styles.authBgOverlay} />

      {showWelcome && (
        <View style={styles.welcomeBackdrop}>
          <FadeInView type="fadeIn" duration={500} style={styles.welcomeContent}>
            <FadeInView type="fadeInDown" delay={200} style={styles.welcomeCheckCircle}>
              <Ionicons name="checkmark-circle" size={72} color={Colors.primary} />
            </FadeInView>
            <FadeInView type="fadeInDown" delay={500}>
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
              <Text style={styles.welcomeSub}>{name || 'Carlos Mendoza'}</Text>
            </FadeInView>
          </FadeInView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <FadeInView type="fadeIn" duration={400} style={styles.authContent}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoGlass, Platform.OS === 'web' && { backdropFilter: 'blur(30px) saturate(200%)', WebkitBackdropFilter: 'blur(30px) saturate(200%)' }] as any}>
              <Ionicons name="football" size={32} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.authTitle}>CanchaYa</Text>
          <Text style={styles.authSubtitle}>Tu cancha, tu partida</Text>

          <View style={[styles.authGlassCard, Platform.OS === 'web' && { backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)' }] as any}>
            <View style={styles.authTabContainer}>
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

            <View style={styles.authForm}>
              {!isLogin && (
                <View style={styles.authInputWrap}>
                  <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.6)" />
                  <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor="rgba(255,255,255,0.5)" value={name} onChangeText={setName} />
                </View>
              )}
              <View style={styles.authInputWrap}>
                <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.6)" />
                <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="rgba(255,255,255,0.5)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.authInputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.6)" />
                <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="rgba(255,255,255,0.5)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.authButton} onPress={handleAuth} disabled={loading} activeOpacity={0.8}>
                <Text style={styles.authButtonText}>{loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>
              </TouchableOpacity>
              <View style={styles.authDivider}>
                <View style={styles.authDividerLine} />
                <Text style={styles.authDividerText}>o</Text>
                <View style={styles.authDividerLine} />
              </View>
              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <Ionicons name="logo-google" size={20} color="#FFF" />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

// ========================
// Venue Card (memoized)
// ========================
const VenueCard = React.memo(function VenueCard({ complex, isFav, onToggleFav, onPress }: {
  complex: any;
  isFav: boolean;
  onToggleFav: () => void;
  onPress: () => void;
}) {
  const { isDarkMode } = useAppStore();
  const isDark = isDarkMode;
  const courtTypes = Array.from(new Set(complex.courts.map((c: any) => c.type))) as string[];

  return (
    <FadeInView type="fadeInDown" duration={400} delay={100}>
      <GlassCard padding={0} style={styles.venueCard}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
          <View style={styles.venueImageContainer}>
            <Image source={{ uri: complex.image }} style={styles.venueImage} contentFit="cover" />
            <TouchableOpacity style={styles.venueHeart} onPress={onToggleFav} activeOpacity={0.7}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? Colors.heart : '#FFF'} />
            </TouchableOpacity>
            <View style={[styles.venueRating, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)' }]}>
              <Ionicons name="star" size={12} color={Colors.star} />
              <Text style={[styles.venueRatingText, { color: isDark ? Colors.textDark : Colors.text }]}>{complex.rating}</Text>
            </View>
          </View>
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
    </FadeInView>
  );
});

// ========================
// Home Screen
// ========================
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    isDarkMode, isAuthenticated, user, searchQuery, setSearchQuery,
    favorites, toggleFavorite, selectComplex, unreadNotificationCount,
    markAllNotificationsRead, recentlyViewed, notifications,
  } = useAppStore();
  const isDark = isDarkMode;

  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Todos');
  const [selectedSport, setSelectedSport] = useState('todos');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'near'>('popular');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Skeleton shimmer animation
  const shimmerAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        RNAnimated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const shimmerOpacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  // Search history debounce: add to history after 1.5s of 3+ chars
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (searchQuery.trim().length >= 3) {
      searchTimerRef.current = setTimeout(() => {
        const q = searchQuery.trim().toLowerCase();
        setSearchHistory(prev => {
          const filtered = prev.filter(h => h.toLowerCase() !== q);
          return [searchQuery.trim(), ...filtered].slice(0, 5);
        });
      }, 1500);
    }
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const removeFromHistory = useCallback((item: string) => {
    setSearchHistory(prev => prev.filter(h => h !== item));
  }, []);

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

  const filteredComplexes = useMemo(() => {
    let result = [...mockComplexes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.courts.some(court => getCourtTypeLabel(court.type).toLowerCase().includes(q))
      );
    }
    if (selectedDistrict !== 'Todos') result = result.filter(c => c.district === selectedDistrict);
    if (selectedSport !== 'todos') result = result.filter(c => c.courts.some(court => court.type === selectedSport));
    if (showFavoritesOnly) result = result.filter(c => favorites.includes(c.id));
    if (sortBy === 'popular') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price') result.sort((a, b) => a.minPrice - b.minPrice);
    return result;
  }, [searchQuery, selectedDistrict, selectedSport, showFavoritesOnly, sortBy, favorites]);

  const recentlyViewedComplexes = useMemo(() => {
    return recentlyViewed.map(id => getComplexById(id)).filter(Boolean);
  }, [recentlyViewed]);

  const handleComplexPress = useCallback((id: string) => {
    selectComplex(id);
    router.push('/detail');
  }, [selectComplex, router]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedDistrict('Todos');
    setSelectedSport('todos');
    setShowFavoritesOnly(false);
  }, [setSearchQuery]);

  if (!isAuthenticated) return <AuthScreen />;

  const firstName = user?.name?.split(' ')[0] || 'Usuario';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <FadeInView type="fadeIn" duration={400} style={styles.header}>
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
              onPress={() => { setShowNotifications(true); markAllNotificationsRead(); }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={isDark ? Colors.textDark : Colors.text} />
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Clima actual */}
        <FadeInView type="fadeInDown" duration={400} delay={50}>
          <GlassCard style={styles.weatherCard}>
            <View style={styles.weatherRow}>
              <View style={[styles.weatherIconWrap, { backgroundColor: isDark ? 'rgba(132,204,22,0.15)' : 'rgba(132,204,22,0.1)' }]}>
                <Ionicons name="sunny" size={24} color="#FBBF24" />
              </View>
              <View style={styles.weatherInfo}>
                <Text style={[styles.weatherTemp, { color: isDark ? Colors.textDark : Colors.text }]}>24°C</Text>
                <Text style={[styles.weatherCondition, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Parcialmente nublado · Lima</Text>
              </View>
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetail}>
                  <Ionicons name="water-outline" size={14} color={Colors.info} />
                  <Text style={[styles.weatherDetailText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>62%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="speedometer-outline" size={14} color={Colors.textTertiary} />
                  <Text style={[styles.weatherDetailText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>12 km/h</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </FadeInView>

        {/* Categorías populares */}
        <FadeInView type="fadeInDown" duration={400} delay={75}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {popularCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : `${cat.color}12`, borderColor: isDark ? 'rgba(255,255,255,0.1)' : `${cat.color}30` }]}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: isDark ? Colors.textDark : cat.color }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeInView>

        {/* Promo Banner */}
        <FadeInView type="fadeInDown" duration={400} delay={100}>
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
                    <View style={styles.bannerGradientOverlay} />
                    <View style={styles.bannerDecor1} />
                    <View style={styles.bannerDecor2} />
                    <View style={styles.bannerDecor3} />
                    <Text style={styles.bannerEmoji}>{item.emoji}</Text>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <TouchableOpacity style={styles.bannerButton} activeOpacity={0.8}>
                      <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              )}
            />
            <View style={styles.bannerDots}>
              {promotionalBanners.map((_, i) => (
                <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
              ))}
            </View>
          </View>
        </FadeInView>

        {/* Search Bar */}
        <FadeInView type="fadeInDown" duration={400} delay={200}>
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
        </FadeInView>

        {/* District pills */}
        <FadeInView type="fadeInDown" duration={400} delay={250}>
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
        </FadeInView>

        {/* Sport type pills */}
        {showFilters && (
          <FadeInView type="fadeInDown" duration={300}>
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
          </FadeInView>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && searchQuery.trim().length > 0 && (
          <FadeInView type="fadeInDown" duration={300}>
            <View style={styles.searchHistorySection}>
              <View style={styles.searchHistoryHeader}>
                <Ionicons name="time-outline" size={14} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                <Text style={[styles.searchHistoryTitle, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Búsquedas recientes</Text>
              </View>
              <View style={styles.searchHistoryPills}>
                {searchHistory.map((item, idx) => (
                  <FadeInView key={item} type="fadeIn" duration={300} delay={idx * 60}>
                    <View style={[styles.historyPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(132,204,22,0.08)', borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(132,204,22,0.2)' }]}>
                      <TouchableOpacity onPress={() => setSearchQuery(item)} activeOpacity={0.7} style={styles.historyPillContent}>
                        <Ionicons name="time-outline" size={12} color={Colors.primary} />
                        <Text style={[styles.historyPillText, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{item}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeFromHistory(item)} activeOpacity={0.7} style={styles.historyPillRemove}>
                        <Ionicons name="close" size={12} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </FadeInView>
                ))}
              </View>
            </View>
          </FadeInView>
        )}

        {/* Recently Viewed */}
        {recentlyViewedComplexes.length > 0 && (
          <FadeInView type="fadeInDown" duration={400}>
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
          </FadeInView>
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

        {/* Venue cards, skeleton, or empty */}
        {isLoading ? (
          // Skeleton loading placeholders
          [1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <RNAnimated.View style={[styles.skeletonImage, { opacity: shimmerOpacity }]} />
              <View style={styles.skeletonContent}>
                <RNAnimated.View style={[styles.skeletonLine, { width: '70%', opacity: shimmerOpacity }]} />
                <RNAnimated.View style={[styles.skeletonLine, { width: '40%', opacity: shimmerOpacity }]} />
                <View style={styles.skeletonRow}>
                  <RNAnimated.View style={[styles.skeletonBadge, { opacity: shimmerOpacity }]} />
                  <RNAnimated.View style={[styles.skeletonBadge, { opacity: shimmerOpacity }]} />
                </View>
                <RNAnimated.View style={[styles.skeletonLine, { width: '50%', opacity: shimmerOpacity }]} />
              </View>
            </View>
          ))
        ) : filteredComplexes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }]}>
              <Ionicons name="search-outline" size={40} color={Colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.textDark : Colors.text }]}>No se encontraron canchas</Text>
            <Text style={[styles.emptySub, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              Intenta con otros filtros o busca algo diferente
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={resetFilters} activeOpacity={0.8}>
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

      {/* Notifications Modal */}
      <Modal visible={showNotifications} transparent animationType="fade" onRequestClose={() => setShowNotifications(false)}>
        <View style={styles.notifModalBackdrop}>
          <View style={[styles.notifModalCard, { backgroundColor: isDark ? Colors.surfaceDark : '#FFF' }]}>
            <View style={styles.notifModalHeader}>
              <Text style={[styles.notifModalTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Notificaciones</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.notifModalClose} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={isDark ? Colors.textDark : Colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.notifList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.notifEmpty}>
                  <Ionicons name="notifications-off-outline" size={40} color={Colors.textTertiary} />
                  <Text style={[styles.notifEmptyText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Sin notificaciones</Text>
                </View>
              }
              renderItem={({ item }) => {
                const notifIcon = item.type === 'booking_confirmed' ? 'checkmark-circle' : item.type === 'booking_reminder' ? 'alarm-outline' : item.type === 'booking_cancelled' ? 'close-circle' : item.type === 'promotion' ? 'pricetag-outline' : 'star-outline';
                const notifColor = item.type === 'booking_confirmed' ? Colors.success : item.type === 'booking_reminder' ? Colors.warning : item.type === 'booking_cancelled' ? Colors.error : item.type === 'promotion' ? Colors.primary : Colors.star;
                return (
                  <View style={[styles.notifItem, !item.read && { backgroundColor: isDark ? 'rgba(132,204,22,0.06)' : 'rgba(132,204,22,0.06)' }]}>
                    <View style={[styles.notifIconWrap, { backgroundColor: notifColor + '15' }]}>
                      <Ionicons name={notifIcon as any} size={18} color={notifColor} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTitleRow}>
                        <Text style={[styles.notifTitle, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{item.title}</Text>
                        {!item.read && <View style={styles.notifUnreadDot} />}
                      </View>
                      <Text style={[styles.notifMessage, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
                      <Text style={styles.notifTime}>{formatNotificationTime(item.timestamp)}</Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },

  // Auth Screen Styles
  authContainer: { flex: 1, position: 'relative' },
  authBgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  authBgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  authContent: { alignItems: 'center' },
  logoContainer: { marginBottom: 14 },
  logoGlass: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  authTitle: { fontSize: 30, fontWeight: '800', color: '#FFF', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  authSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 28 },
  authTabContainer: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20, width: '100%', backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  authTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  authTabText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  authForm: { width: '100%', gap: 10 },
  authGlassCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  authInputWrap: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 4, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', height: 48,
  },
  input: { flex: 1, height: 44, fontSize: 14, color: '#FFF' },
  authDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 6 },
  authDividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  authDividerText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  authButton: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  authButtonText: { color: '#111', fontWeight: '700', fontSize: 16 },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 8, gap: 8, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' },
  googleButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  welcomeBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  welcomeContent: { alignItems: 'center', justifyContent: 'center' },
  welcomeCheckCircle: { marginBottom: 20 },
  welcomeTitle: { fontSize: 30, fontWeight: '800', textAlign: 'center', color: Colors.text },
  welcomeSub: { fontSize: 17, textAlign: 'center', marginTop: 6, color: Colors.textSecondary },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 22, fontWeight: '800' },
  subGreeting: { fontSize: 14, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationBell: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(132,204,22,0.1)' },
  notificationBadge: { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  notificationBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

  // Banner
  bannerContainer: { marginBottom: 16 },
  bannerCard: { overflow: 'hidden', borderRadius: 16 },
  bannerInner: { padding: 8, borderRadius: 16, overflow: 'hidden', minHeight: 40, justifyContent: 'center' },
  bannerGradientOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16 },
  bannerDecor1: { position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)' },
  bannerDecor2: { position: 'absolute', bottom: -20, left: 30, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.1)' },
  bannerDecor3: { position: 'absolute', top: 10, right: 60, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bannerEmoji: { fontSize: 16, marginBottom: 1 },
  bannerTitle: { fontSize: 11, fontWeight: '700', color: '#FFF', marginBottom: 2, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  bannerButton: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 16, alignSelf: 'flex-start' },
  bannerButtonText: { color: '#FFF', fontWeight: '600', fontSize: 10 },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc' },
  dotActive: { backgroundColor: Colors.primary, width: 20 },

  // Search
  searchCard: { marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, height: 28, fontSize: 14 },

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
  favToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, alignSelf: 'flex-start', marginBottom: 12 },
  favToggleActive: { borderColor: Colors.heart, backgroundColor: 'rgba(239,68,68,0.08)' },
  favToggleText: { fontSize: 13, fontWeight: '600', color: '#666' },

  // Search History
  searchHistorySection: { marginBottom: 12 },
  searchHistoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  searchHistoryTitle: { fontSize: 12, fontWeight: '600' },
  searchHistoryPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  historyPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingRight: 4, paddingLeft: 10, paddingVertical: 4 },
  historyPillContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyPillText: { fontSize: 12, fontWeight: '500', maxWidth: 100 },
  historyPillRemove: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 2 },

  // Venue card
  venueCard: { marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  venueImageContainer: { position: 'relative', width: '100%', aspectRatio: 16 / 9 },
  venueImage: { width: '100%', height: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  venueHeart: { position: 'absolute', top: 8, right: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
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

  // Notifications Modal
  notifModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  notifModalCard: { width: '100%', maxWidth: 400, maxHeight: '80%', borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, alignSelf: 'center' },
  notifModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  notifModalTitle: { fontSize: 18, fontWeight: '800' },
  notifModalClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  notifList: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  notifEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  notifEmptyText: { fontSize: 14, fontWeight: '500' },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, marginBottom: 4 },
  notifIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 2 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  notifUnreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  notifMessage: { fontSize: 12, lineHeight: 16 },
  notifTime: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },

  // Weather card
  weatherCard: { marginBottom: 12 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weatherIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  weatherInfo: { flex: 1 },
  weatherTemp: { fontSize: 20, fontWeight: '800' },
  weatherCondition: { fontSize: 12, marginTop: 1 },
  weatherDetails: { gap: 4 },
  weatherDetail: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  weatherDetailText: { fontSize: 11, fontWeight: '500' },

  // Categories
  categoriesScroll: { marginBottom: 12, marginHorizontal: -16, paddingHorizontal: 16 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontWeight: '600' },

  // Skeleton
  skeletonCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 14, backgroundColor: 'rgba(132,204,22,0.06)' },
  skeletonImage: { width: '100%', aspectRatio: 16 / 9, backgroundColor: Colors.border },
  skeletonContent: { padding: 12, gap: 8 },
  skeletonLine: { height: 14, borderRadius: 4, backgroundColor: Colors.border },
  skeletonRow: { flexDirection: 'row', gap: 6 },
  skeletonBadge: { width: 60, height: 20, borderRadius: 8, backgroundColor: Colors.border },
});
