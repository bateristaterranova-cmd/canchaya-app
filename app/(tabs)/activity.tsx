import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
  Easing,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInView } from '../../components/FadeInView';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAppStore } from '../../lib/store';
import {
  mockComplexes,
  getReservationStatusLabel,
  formatPrice,
  type Reservation,
} from '../../lib/mock-data';
import { Colors, Shadows } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

type TabType = 'proximas' | 'historial';

const STATUS_CONFIG: Record<
  Reservation['status'],
  { color: string; bgColor: string; label: string }
> = {
  confirmed: { color: '#22C55E', bgColor: 'rgba(34,197,94,0.12)', label: 'Confirmada' },
  pending: { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)', label: 'Pendiente' },
  in_process: { color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)', label: 'En proceso' },
  cancelled: { color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)', label: 'Cancelada' },
  completed: { color: '#94A3B8', bgColor: 'rgba(148,163,184,0.12)', label: 'Completada' },
};

// Status left border colors using theme Colors
const STATUS_BORDER_COLORS: Record<Reservation['status'], string> = {
  confirmed: Colors.success,
  pending: Colors.warning,
  cancelled: Colors.error,
  completed: Colors.textTertiary,
  in_process: Colors.info,
};

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('proximas');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    const now = new Date();
    return `Actualizado: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const spinValue = useRef(new RNAnimated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Próximos 7 días pills (usando date-fns con locale español)
  const next7Days = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(new Date(), i);
      days.push({
        date: format(d, 'yyyy-MM-dd'),
        dayName: format(d, 'EEE', { locale: es }).replace('.', '').charAt(0).toUpperCase() + format(d, 'EEE', { locale: es }).replace('.', '').slice(1),
        dayNumber: d.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  const reservations = useAppStore((s) => s.reservations);
  const cancelReservation = useAppStore((s) => s.cancelReservation);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const isDark = isDarkMode;
  const router = useRouter();

  const proximas = reservations.filter(
    (r) => r.status === 'confirmed' || r.status === 'pending' || r.status === 'in_process'
  );
  const historial = reservations.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled'
  );

  const data = activeTab === 'proximas' ? proximas : historial;

  // Filter by selected day
  const filteredData = selectedDay === 'todos' ? data : data.filter(r => r.date === selectedDay);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    RNAnimated.loop(RNAnimated.timing(spinValue, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })).start();
    setTimeout(() => {
      setRefreshing(false);
      spinValue.setValue(0);
      const now = new Date();
      setLastUpdated(`Actualizado: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 1200);
  }, []);

  const spinStyle = { transform: [{ rotate: spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] };

  const handleCancel = (id: string) => {
    cancelReservation(id);
  };

  const getComplexImage = (complexId: string) => {
    const complex = mockComplexes.find((c) => c.id === complexId);
    return complex?.image || 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200';
  };

  const getComplexAddress = (complexId: string) => {
    const complex = mockComplexes.find((c) => c.id === complexId);
    return complex?.address || '';
  };

  const getCourtSurface = (complexId: string, courtId: string) => {
    const complex = mockComplexes.find((c) => c.id === complexId);
    const court = complex?.courts.find((c) => c.id === courtId);
    return court?.surface || '';
  };

  const toggleExpand = (id: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const renderReservation = ({ item, index }: { item: Reservation; index: number }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const canCancel = item.status === 'pending' || item.status === 'confirmed';
    const borderColor = STATUS_BORDER_COLORS[item.status];
    const isExpanded = expandedId === item.id;
    const address = getComplexAddress(item.complexId);
    const surface = getCourtSurface(item.complexId, item.courtId);

    return (
      <FadeInView type="fadeInDown" duration={400} delay={index * 80}>
        <GlassCard style={[styles.reservationCard, { borderLeftWidth: 4, borderLeftColor: borderColor }]}>
          <View style={styles.cardRow}>
            <Image
              source={{ uri: getComplexImage(item.complexId) }}
              style={styles.thumbnail}
              contentFit="cover"
            />
            <View style={styles.cardContent}>
              <Text style={[styles.complexName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>
                {item.complexName}
              </Text>
              <Text style={[styles.courtName, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>
                {item.courtName}
              </Text>
              <View style={styles.detailsRow}>
                <Ionicons name="calendar-outline" size={13} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                <Text style={[styles.detailText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{item.date}</Text>
                <Ionicons name="time-outline" size={13} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                <Text style={[styles.detailText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                  {item.startTime} - {item.endTime}
                </Text>
              </View>
              <View style={styles.bottomRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  {item.status === 'confirmed' && <View style={[styles.statusIndicator, { backgroundColor: '#22C55E' }]} />}
                  {item.status === 'pending' && <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />}
                  {item.status === 'completed' && <View style={[styles.statusIndicator, { backgroundColor: '#94A3B8' }]} />}
                  {item.status === 'cancelled' && <View style={[styles.statusIndicator, { backgroundColor: '#EF4444' }]} />}
                  <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
                <Text style={[styles.price, { color: isDark ? Colors.textDark : Colors.text }]}>{formatPrice(item.totalPrice)}</Text>
              </View>
            </View>
          </View>

          {/* Ver detalles button */}
          <Pressable onPress={() => toggleExpand(item.id)} style={styles.expandButton}>
            <Text style={[styles.expandButtonText, { color: Colors.primary }]}>
              {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.primary}
            />
          </Pressable>

          {/* Expanded details */}
          {isExpanded && (
            <FadeInView type="fadeIn" duration={200}>
              <View style={[styles.expandedContent, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                {address ? (
                  <View style={styles.expandedRow}>
                    <Ionicons name="location-outline" size={15} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                    <Text style={[styles.expandedText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{address}</Text>
                  </View>
                ) : null}
                {surface ? (
                  <View style={styles.expandedRow}>
                    <Ionicons name="tennisball-outline" size={15} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                    <Text style={[styles.expandedText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{surface}</Text>
                  </View>
                ) : null}
                {canCancel && (
                  <TouchableOpacity
                    onPress={() => handleCancel(item.id)}
                    style={styles.cancelReservationButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={Colors.error} />
                    <Text style={styles.cancelReservationText}>Cancelar reserva</Text>
                  </TouchableOpacity>
                )}
              </View>
            </FadeInView>
          )}
        </GlassCard>
      </FadeInView>
    );
  };

  const renderEmpty = () => {
    const isDateFiltered = selectedDay !== 'todos';
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? 'rgba(132,204,22,0.08)' : 'rgba(148,163,184,0.1)' }]}>
          <Ionicons
            name={isDateFiltered ? 'calendar-outline' : 'calendar-outline'}
            size={48}
            color={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
          />
        </View>
        {isDateFiltered ? (
          <>
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Sin reservas para este día</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              No tienes reservas para la fecha seleccionada
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: Colors.primary }]}
              onPress={() => setSelectedDay('todos')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Ver todas</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.textDark : Colors.text }]}>No tienes reservas</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              {activeTab === 'proximas'
                ? 'Aún no tienes reservas próximas'
                : 'Aún no tienes reservas en tu historial'}
            </Text>
            {activeTab === 'proximas' && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: Colors.primary }]}
                onPress={() => router.navigate('/(tabs)')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>Reservar ahora</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  const proximasCount = proximas.length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 8 + 8 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Mi Actividad</Text>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <RNAnimated.View style={refreshing ? spinStyle : undefined}>
            <Ionicons name="refresh" size={22} color={isDark ? Colors.textSecondaryDark : Colors.textSecondary} />
          </RNAnimated.View>
        </Pressable>
      </View>

      {/* Last Updated + Refresh Indicator */}
      <View style={styles.lastUpdatedRow}>
        {refreshing ? (
          <View style={styles.refreshingIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.refreshingText}>Actualizando...</Text>
          </View>
        ) : (
          <Text style={[styles.lastUpdatedText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>{lastUpdated}</Text>
        )}
      </View>

      {/* Próximos 7 días */}
      <View style={styles.dayPillsContainer}>
        <Text style={[styles.dayPillsTitle, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Próximos 7 días</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPillsScroll}>
          <TouchableOpacity
            style={[styles.dayPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }, selectedDay === 'todos' && styles.dayPillActive]}
            onPress={() => setSelectedDay('todos')}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayPillText, { color: isDark ? Colors.textTertiaryDark : '#94A3B8' }, selectedDay === 'todos' && styles.dayPillTextActive]}>Todos</Text>
          </TouchableOpacity>
          {next7Days.map((day: { date: string; dayName: string; dayNumber: number; isToday: boolean }) => (
            <TouchableOpacity
              key={day.date}
              style={[styles.dayPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }, selectedDay === day.date && styles.dayPillActive]}
              onPress={() => setSelectedDay(day.date)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayPillDay, { color: isDark ? Colors.textTertiaryDark : '#94A3B8' }, selectedDay === day.date && styles.dayPillTextActive]}>{day.dayName}</Text>
              <Text style={[styles.dayPillNum, { color: isDark ? Colors.textSecondaryDark : '#64748B' }, selectedDay === day.date && styles.dayPillTextActive]}>{day.dayNumber}</Text>
              {day.isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabPill, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface, borderColor: isDark ? Colors.borderDark : Colors.border }]}>
          <Pressable
            onPress={() => setActiveTab('proximas')}
            style={[styles.tabButton, activeTab === 'proximas' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'proximas' && styles.tabTextActive]}>
              Próximas
            </Text>
            {proximasCount > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: Colors.primary }]}>
                <Text style={styles.tabBadgeText}>{proximasCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('historial')}
            style={[styles.tabButton, activeTab === 'historial' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'historial' && styles.tabTextActive]}>
              Historial
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Reservations List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={data.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  lastUpdatedRow: { paddingHorizontal: 20, paddingBottom: 4, paddingTop: 2 },
  lastUpdatedText: { fontSize: 12, fontWeight: '500' },
  refreshingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshingText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  tabContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  tabPill: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  tabButtonActive: { backgroundColor: Colors.primaryBg },
  tabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: Colors.primary },
  tabBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabBadgeText: { color: '#0F172A', fontSize: 11, fontWeight: 'bold' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  emptyList: { flexGrow: 1 },
  reservationCard: { marginBottom: 12 },
  cardRow: { flexDirection: 'row', gap: 12 },
  thumbnail: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#E2E8F0' },
  cardContent: { flex: 1, gap: 3, overflow: 'hidden' },
  complexName: { fontSize: 15, fontWeight: '700' },
  courtName: { fontSize: 13 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  detailText: { fontSize: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusIndicator: { width: 4, height: 4, borderRadius: 2, position: 'absolute', top: -2, right: -2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  price: { fontSize: 15, fontWeight: 'bold' },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  expandButtonText: { fontSize: 12, fontWeight: '600' },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedText: { fontSize: 13, flex: 1 },
  cancelReservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  cancelReservationText: { fontSize: 13, color: Colors.error, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(148,163,184,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  emptyButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { color: '#111', fontWeight: '700', fontSize: 15 },

  // Day pills
  dayPillsContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  dayPillsTitle: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  dayPillsScroll: { gap: 6, paddingRight: 12 },
  dayPill: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, minWidth: 50 },
  dayPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayPillDay: { fontSize: 10, fontWeight: '500' },
  dayPillNum: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  dayPillText: { fontSize: 12, fontWeight: '500' },
  dayPillTextActive: { color: '#111' },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 2 },
});
