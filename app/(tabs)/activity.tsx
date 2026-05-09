import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

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

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('proximas');
  const [refreshing, setRefreshing] = useState(false);
  const spinValue = useSharedValue(0);
  const insets = useSafeAreaInsets();

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    spinValue.value = withRepeat(withTiming(360, { duration: 800 }), -1, false);
    setTimeout(() => {
      setRefreshing(false);
      spinValue.value = 0;
    }, 1200);
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));

  const handleCancel = (id: string) => {
    cancelReservation(id);
  };

  const getComplexImage = (complexId: string) => {
    const complex = mockComplexes.find((c) => c.id === complexId);
    return complex?.image || 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200';
  };

  const renderReservation = ({ item, index }: { item: Reservation; index: number }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const canCancel = item.status === 'pending' || item.status === 'confirmed';

    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
        <GlassCard style={styles.reservationCard}>
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
                  <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
                <Text style={[styles.price, { color: isDark ? Colors.textDark : Colors.text }]}>{formatPrice(item.totalPrice)}</Text>
              </View>
            </View>
          </View>
          {canCancel && (
            <Pressable onPress={() => handleCancel(item.id)} style={styles.cancelButton}>
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          )}
        </GlassCard>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="calendar-outline" size={48} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
      </View>
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
    </View>
  );

  const proximasCount = proximas.length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 8 + 8 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Mi Actividad</Text>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <Animated.View style={refreshing ? spinStyle : undefined}>
            <Ionicons name="refresh" size={22} color={isDark ? Colors.textSecondaryDark : Colors.textSecondary} />
          </Animated.View>
        </Pressable>
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
        data={data}
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
  statusText: { fontSize: 11, fontWeight: '600' },
  price: { fontSize: 15, fontWeight: 'bold' },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cancelText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
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
});
