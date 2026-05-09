import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import {
  mockComplexes,
  getReservationStatusLabel,
  formatPrice,
  type Reservation,
} from '@/lib/mock-data';
import { Colors, GlassShadows, NeonShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';

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

  const reservations = useAppStore((s) => s.reservations);
  const cancelReservation = useAppStore((s) => s.cancelReservation);
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
            {/* Thumbnail */}
            <Image
              source={{ uri: getComplexImage(item.complexId) }}
              style={styles.thumbnail}
              contentFit="cover"
            />

            {/* Content */}
            <View style={styles.cardContent}>
              <Text style={styles.complexName} numberOfLines={1}>
                {item.complexName}
              </Text>
              <Text style={styles.courtName} numberOfLines={1}>
                {item.courtName}
              </Text>
              <View style={styles.detailsRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.light.textSecondary} />
                <Text style={styles.detailText}>{item.date}</Text>
                <Ionicons name="time-outline" size={13} color={Colors.light.textSecondary} />
                <Text style={styles.detailText}>
                  {item.startTime} - {item.endTime}
                </Text>
              </View>
              <View style={styles.bottomRow}>
                {/* Status badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
                {/* Price */}
                <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
              </View>
            </View>
          </View>

          {/* Cancel button */}
          {canCancel && (
            <Pressable
              onPress={() => handleCancel(item.id)}
              style={styles.cancelButton}
            >
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
        <Ionicons name="calendar-outline" size={48} color={Colors.light.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No tienes reservas</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'proximas'
          ? 'Aún no tienes reservas próximas'
          : 'Aún no tienes reservas en tu historial'}
      </Text>
      {activeTab === 'proximas' && (
        <View style={styles.emptyButton}>
          <NeonButton
            title="Reservar ahora"
            onPress={() => router.navigate('/(tabs)/home')}
            size="md"
          />
        </View>
      )}
    </View>
  );

  const proximasCount = proximas.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Actividad</Text>
        {/* Refresh button */}
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <Animated.View style={refreshing ? spinStyle : undefined}>
            <Ionicons name="refresh" size={22} color={Colors.light.textSecondary} />
          </Animated.View>
        </Pressable>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={styles.tabPill}>
          <Pressable
            onPress={() => setActiveTab('proximas')}
            style={[styles.tabButton, activeTab === 'proximas' && styles.tabButtonActive]}
          >
            <Text
              style={[styles.tabText, activeTab === 'proximas' && styles.tabTextActive]}
            >
              Próximas
            </Text>
            {proximasCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{proximasCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('historial')}
            style={[styles.tabButton, activeTab === 'historial' && styles.tabButtonActive]}
          >
            <Text
              style={[styles.tabText, activeTab === 'historial' && styles.tabTextActive]}
            >
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.neonGreen} />
        }
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  tabPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...GlassShadows.light,
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
  tabButtonActive: {
    backgroundColor: 'rgba(57,255,20,0.12)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: Colors.neonGreen,
  },
  tabBadge: {
    backgroundColor: Colors.neonGreen,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabBadgeText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  reservationCard: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    gap: 3,
    overflow: 'hidden',
  },
  complexName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  courtName: {
    fontSize: 13,
    color: '#64748B',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
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
  cancelText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
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
    width: '100%',
    alignItems: 'center',
  },
});
