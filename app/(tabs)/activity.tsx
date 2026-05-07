import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import { formatPrice, getReservationStatusLabel, getComplexById } from '../../lib/mock-data';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

type ResTab = 'upcoming' | 'history';

const statusColors: Record<string, string> = {
  confirmed: Colors.success,
  pending: Colors.warning,
  in_process: Colors.info,
  cancelled: Colors.error,
  completed: '#999',
};

export default function ActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, isAuthenticated, reservations, cancelReservation, setActiveTab } = useAppStore();
  const isDark = isDarkMode;

  const [activeTab, setActiveTabLocal] = useState<ResTab>('upcoming');

  const upcoming = useMemo(() =>
    reservations.filter(r => r.status === 'pending' || r.status === 'confirmed' || r.status === 'in_process'),
    [reservations]
  );

  const history = useMemo(() =>
    reservations.filter(r => r.status === 'completed' || r.status === 'cancelled'),
    [reservations]
  );

  const displayList = activeTab === 'upcoming' ? upcoming : history;

  const handleCancel = (id: string) => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => cancelReservation(id) },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.authGuard, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.authGuardText, { color: isDark ? Colors.textDark : Colors.text }]}>Inicia sesión para ver tus reservas</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Mis Reservas</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && { backgroundColor: Colors.primary }]}
          onPress={() => setActiveTabLocal('upcoming')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && { color: '#111', fontWeight: '700' }]}>
            Próximas
          </Text>
          {upcoming.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'upcoming' ? { backgroundColor: 'rgba(0,0,0,0.2)' } : { backgroundColor: 'rgba(132, 204, 22, 0.12)', borderWidth: 1, borderColor: 'rgba(132, 204, 22, 0.2)' }]}>
              <Text style={[styles.tabBadgeText, activeTab === 'upcoming' && { color: '#111' }]}>{upcoming.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && { backgroundColor: Colors.primary }]}
          onPress={() => setActiveTabLocal('history')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'history' && { color: '#111', fontWeight: '700' }]}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const complex = getComplexById(item.complexId);
          const statusColor = statusColors[item.status] || '#999';
          return (
            <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
              <GlassCard style={styles.resCard} padding={12}>
                <View style={styles.resRow}>
                  {complex && (
                    <Image source={{ uri: complex.image }} style={styles.resImage} contentFit="cover" />
                  )}
                  <View style={styles.resInfo}>
                    <Text style={[styles.resComplexName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>
                      {item.complexName}
                    </Text>
                    <Text style={[styles.resCourtName, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>
                      {item.courtName}
                    </Text>
                    <View style={styles.resDetails}>
                      <View style={styles.resDetailItem}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
                        <Text style={[styles.resDetailText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{item.date}</Text>
                      </View>
                      <View style={styles.resDetailItem}>
                        <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
                        <Text style={[styles.resDetailText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{item.startTime} - {item.endTime}</Text>
                      </View>
                    </View>
                    <View style={styles.resBottomRow}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{getReservationStatusLabel(item.status)}</Text>
                      </View>
                      <Text style={styles.resPrice}>{formatPrice(item.totalPrice)}</Text>
                    </View>
                  </View>
                </View>
                {(item.status === 'pending' || item.status === 'confirmed') && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }]}>
              <Ionicons name="calendar-outline" size={40} color={Colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.textDark : Colors.text }]}>
              {activeTab === 'upcoming' ? 'No tienes reservas próximas' : 'No hay historial'}
            </Text>
            <Text style={[styles.emptySub, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              {activeTab === 'upcoming' ? 'Reserva una cancha y aparecerá aquí' : 'Tus reservas completadas aparecerán aquí'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setActiveTab('home')}
                activeOpacity={0.8}
              >
                <Ionicons name="search-outline" size={16} color="#111" />
                <Text style={styles.emptyButtonText}>Reservar ahora</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  authGuard: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  authGuardText: { fontSize: 16, fontWeight: '600' },

  header: { paddingHorizontal: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800' },

  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(132,204,22,0.08)', borderRadius: 12, padding: 3 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabBadge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 10 },
  tabBadgeText: { fontSize: 11, fontWeight: '700', color: '#4D7C0F' },

  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  resCard: { marginBottom: 10, position: 'relative' },
  resRow: { flexDirection: 'row', gap: 10 },
  resImage: { width: 60, height: 60, borderRadius: 10 },
  resInfo: { flex: 1, gap: 3 },
  resComplexName: { fontSize: 14, fontWeight: '700' },
  resCourtName: { fontSize: 12 },
  resDetails: { flexDirection: 'row', gap: 12, marginTop: 2 },
  resDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  resDetailText: { fontSize: 11 },
  resBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  resPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  cancelBtn: { marginTop: 8, alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.error },
  cancelBtnText: { color: Colors.error, fontWeight: '600', fontSize: 12 },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  emptyButtonText: { color: '#111', fontWeight: '700', fontSize: 14 },
});
