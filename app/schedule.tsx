import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../lib/store';
import { getComplexById, formatPrice, mockTimeSlots } from '../lib/mock-data';
import { Colors } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getNext7Days() {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      fullDate: d.toISOString().split('T')[0],
      isToday: i === 0,
    };
  });
}

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, selectedComplexId, selectedCourtId, selectedDate, selectedTimeSlot, selectDate, selectTimeSlot } = useAppStore();
  const isDark = isDarkMode;

  const complex = getComplexById(selectedComplexId || '');
  const court = complex?.courts.find(c => c.id === selectedCourtId) || complex?.courts[0];
  const dates = useMemo(() => getNext7Days(), []);
  const [localDate, setLocalDate] = useState(selectedDate || dates[0].fullDate);

  const selectedDateObj = dates.find(d => d.fullDate === localDate) || dates[0];
  const availableCount = mockTimeSlots.filter(s => s.available).length;

  if (!complex || !court) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.emptyText, { color: isDark ? Colors.textDark : Colors.text }]}>No se encontró la cancha</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDateSelect = (fullDate: string) => {
    setLocalDate(fullDate);
    selectDate(fullDate);
  };

  const handleTimeSelect = (time: string, available: boolean) => {
    if (!available) return;
    selectTimeSlot(time);
  };

  const handleContinue = () => {
    if (!selectedTimeSlot) return;
    router.push('/checkout');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top || 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={isDark ? Colors.textDark : Colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Horario</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepRow}>
            <View style={styles.stepCompleted}><Ionicons name="checkmark" size={14} color="#FFF" /></View>
            <Text style={[styles.stepLabel, { color: Colors.primary }]}>Detalle</Text>
          </View>
          <View style={[styles.stepLine, { backgroundColor: Colors.primary }]} />
          <View style={styles.stepRow}>
            <View style={[styles.stepActive, { borderColor: Colors.primary }]}><Text style={styles.stepActiveNum}>2</Text></View>
            <Text style={[styles.stepLabel, { color: Colors.primary }]}>Horario</Text>
          </View>
          <View style={[styles.stepLine, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
          <View style={styles.stepRow}>
            <View style={[styles.stepPending, { borderColor: isDark ? Colors.borderDark : Colors.border }]}>
              <Text style={[styles.stepPendingNum, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Pago</Text>
          </View>
        </View>

        {/* Court info */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <GlassCard style={styles.courtInfoCard} padding={12}>
            <View style={styles.courtInfoRow}>
              <Ionicons name="football" size={18} color={Colors.primary} />
              <View style={styles.courtInfoText}>
                <Text style={[styles.courtInfoName, { color: isDark ? Colors.textDark : Colors.text }]}>{court.name}</Text>
                <Text style={[styles.courtInfoComplex, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{complex.name}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Month */}
        <Animated.View entering={FadeInDown.duration(300).delay(50)}>
          <Text style={[styles.monthTitle, { color: isDark ? Colors.textDark : Colors.text }]}>{selectedDateObj.month}</Text>
        </Animated.View>

        {/* Date pills */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {dates.map((d) => {
              const isSelected = localDate === d.fullDate;
              return (
                <TouchableOpacity
                  key={d.fullDate}
                  style={[styles.datePill, isSelected ? { backgroundColor: Colors.primary } : { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface, borderColor: isDark ? Colors.borderDark : Colors.border }]}
                  onPress={() => handleDateSelect(d.fullDate)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateDayName, isSelected && { color: '#111', fontWeight: '700' }]}>{d.dayName}</Text>
                  <Text style={[styles.dateDayNum, isSelected && { color: '#111', fontWeight: '800' }]}>{d.dayNum}</Text>
                  {d.isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: '#111' }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Time legend */}
        <Animated.View entering={FadeInDown.duration(300).delay(150)}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={[styles.legendText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
              <Text style={[styles.legendText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Ocupado</Text>
            </View>
            {availableCount <= 3 && availableCount > 0 && (
              <View style={styles.lowAvailBadge}>
                <Ionicons name="alert-circle-outline" size={12} color={Colors.warning} />
                <Text style={styles.lowAvailText}>Poca disponibilidad</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Time grid */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <View style={styles.timeGrid}>
            {mockTimeSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <TouchableOpacity
                  key={slot.time}
                  style={[styles.timeSlot, !slot.available && styles.timeSlotOccupied, isSelected && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                  onPress={() => handleTimeSelect(slot.time, slot.available)}
                  disabled={!slot.available}
                  activeOpacity={slot.available ? 0.7 : 1}
                >
                  <Text style={[styles.timeSlotText, !slot.available && styles.timeSlotTextOccupied, isSelected && { color: '#111', fontWeight: '800' }]}>{slot.time}</Text>
                  {slot.available && <Text style={[styles.timeSlotPrice, isSelected && { color: '#111' }]}>{formatPrice(slot.price)}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {availableCount === 0 && (
          <View style={styles.allTakenContainer}>
            <Ionicons name="alert-circle-outline" size={36} color={Colors.warning} />
            <Text style={[styles.allTakenTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Todos los horarios están ocupados</Text>
            <Text style={[styles.allTakenSub, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Prueba seleccionando otra fecha</Text>
          </View>
        )}

        {/* Summary */}
        {selectedTimeSlot && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <GlassCard style={styles.summaryCard} padding={12}>
              <View style={styles.summaryRow}>
                <Ionicons name="time" size={16} color={Colors.primary} />
                <View style={styles.summaryInfo}>
                  <Text style={[styles.summaryDate, { color: isDark ? Colors.textDark : Colors.text }]}>{localDate}</Text>
                  <Text style={[styles.summaryTime, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                    {selectedTimeSlot} - {String(parseInt(selectedTimeSlot.split(':')[0]) + 1).padStart(2, '0')}:00
                  </Text>
                </View>
                <Text style={styles.summaryPrice}>
                  {formatPrice(mockTimeSlots.find(s => s.time === selectedTimeSlot)?.price || court.pricePerHour)}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        <Text style={[styles.pricingNote, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Los precios pueden variar según el horario</Text>
      </ScrollView>

      {/* Sticky bottom */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <View style={styles.bottomBarInner}>
          <View>
            <Text style={[styles.bottomBarLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Total</Text>
            <Text style={styles.bottomBarPrice}>
              {formatPrice(selectedTimeSlot ? (mockTimeSlots.find(s => s.time === selectedTimeSlot)?.price || court.pricePerHour) : court.pricePerHour)}
            </Text>
          </View>
          <TouchableOpacity style={[styles.continueButton, !selectedTimeSlot && { opacity: 0.5 }]} onPress={handleContinue} disabled={!selectedTimeSlot} activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color="#111" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: 8, marginTop: 8 },
  backBtnText: { color: '#111', fontWeight: '700' },
  scrollView: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  backButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(132,204,22,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, marginBottom: 16 },
  stepRow: { alignItems: 'center', gap: 4 },
  stepCompleted: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepActive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepActiveNum: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  stepPending: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepPendingNum: { fontSize: 12, fontWeight: '600' },
  stepLabel: { fontSize: 11, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 6 },
  courtInfoCard: { marginHorizontal: 16, marginBottom: 12 },
  courtInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  courtInfoText: { flex: 1 },
  courtInfoName: { fontSize: 14, fontWeight: '700' },
  courtInfoComplex: { fontSize: 12 },
  monthTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 },
  dateScroll: { paddingHorizontal: 16, marginBottom: 12 },
  datePill: { width: 56, alignItems: 'center', paddingVertical: 10, borderRadius: 14, marginRight: 8, borderWidth: 1, borderColor: 'transparent', gap: 2 },
  dateDayName: { fontSize: 11, fontWeight: '500', color: '#999' },
  dateDayNum: { fontSize: 18, fontWeight: '700', color: '#666' },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },
  lowAvailBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(234,179,8,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  lowAvailText: { fontSize: 10, fontWeight: '600', color: Colors.warning },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  timeSlot: { width: (SCREEN_WIDTH - 40) / 3, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.success + '30', backgroundColor: Colors.success + '10', gap: 2 },
  timeSlotOccupied: { borderColor: Colors.error + '30', backgroundColor: Colors.error + '08' },
  timeSlotText: { fontSize: 14, fontWeight: '700', color: Colors.success },
  timeSlotTextOccupied: { color: Colors.error + '60' },
  timeSlotPrice: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  allTakenContainer: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  allTakenTitle: { fontSize: 16, fontWeight: '700' },
  allTakenSub: { fontSize: 13 },
  summaryCard: { marginHorizontal: 16, marginTop: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryInfo: { flex: 1 },
  summaryDate: { fontSize: 13, fontWeight: '600' },
  summaryTime: { fontSize: 12 },
  summaryPrice: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  pricingNote: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 16, paddingTop: 12 },
  bottomBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomBarLabel: { fontSize: 11 },
  bottomBarPrice: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  continueButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  continueButtonText: { color: '#111', fontWeight: '700', fontSize: 15 },
});
