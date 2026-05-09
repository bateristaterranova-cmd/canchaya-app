import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import {
  mockTimeSlots,
  getComplexById,
  getCourtById,
  formatPrice,
} from '../lib/mock-data';
import { Colors, Shadows } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface DateOption {
  date: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
}

function getNext7Days(): DateOption[] {
  const days: DateOption[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayName: DAY_NAMES[d.getDay()],
      dayNumber: d.getDate(),
      monthName: MONTH_NAMES[d.getMonth()],
      isToday: i === 0,
    });
  }
  return days;
}

export default function ScheduleScreen() {
  const selectedComplexId = useAppStore((s) => s.selectedComplexId);
  const selectedCourtId = useAppStore((s) => s.selectedCourtId);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const selectedTimeSlot = useAppStore((s) => s.selectedTimeSlot);
  const selectDate = useAppStore((s) => s.selectDate);
  const selectTimeSlot = useAppStore((s) => s.selectTimeSlot);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const isDark = isDarkMode;
  const insets = useSafeAreaInsets();

  const dateOptions = useMemo(() => getNext7Days(), []);
  const [activeMonth, setActiveMonth] = useState(dateOptions[0]?.monthName || '');

  const complex = useMemo(
    () => (selectedComplexId ? getComplexById(selectedComplexId) : undefined),
    [selectedComplexId]
  );
  const court = useMemo(
    () =>
      selectedComplexId && selectedCourtId
        ? getCourtById(selectedComplexId, selectedCourtId)
        : undefined,
    [selectedComplexId, selectedCourtId]
  );

  const availableCount = useMemo(
    () => mockTimeSlots.filter((s) => s.available).length,
    []
  );
  const lowAvailability = availableCount <= 3 && availableCount > 0;

  const selectedSlot = useMemo(
    () => mockTimeSlots.find((s) => s.time === selectedTimeSlot),
    [selectedTimeSlot]
  );

  const handleDateSelect = (dateOption: DateOption) => {
    selectDate(dateOption.date);
    setActiveMonth(dateOption.monthName);
  };

  const handleTimeSelect = (time: string, available: boolean) => {
    if (!available) return;
    selectTimeSlot(selectedTimeSlot === time ? null : time);
  };

  const handleContinue = () => {
    if (selectedTimeSlot) {
      router.push('/checkout');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header + Stepper */}
        <View style={{ paddingHorizontal: 16, paddingTop: (insets.top || 12) + 4, paddingBottom: 8 }}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={isDark ? Colors.textDark : Colors.text} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Horario</Text>
          </View>

          {/* Stepper */}
          <View style={styles.stepper}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, { backgroundColor: Colors.primary }]}>
                <Ionicons name="checkmark" size={16} color="#0F172A" />
              </View>
              <Text style={[styles.stepText, { color: Colors.primary }]}>Detalle</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: Colors.primary }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, { borderWidth: 2, borderColor: Colors.primary }]}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary }} />
              </View>
              <Text style={[styles.stepText, { color: Colors.primary }]}>Horario</Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: isDark ? Colors.borderDark : '#E2E8F0' }]} />
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, { borderWidth: 2, borderColor: isDark ? Colors.borderDark : '#CBD5E1' }]}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isDark ? Colors.borderDark : '#CBD5E1' }} />
              </View>
              <Text style={[styles.stepText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Pago</Text>
            </View>
          </View>
        </View>

        {/* Court info summary */}
        {complex && court && (
          <Animated.View entering={FadeIn.duration(300)} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <GlassCard style={styles.courtInfoCard}>
              <View style={styles.courtInfoRow}>
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text style={[styles.courtInfoText, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>
                  {complex.name}
                </Text>
                <Text style={[styles.courtInfoDot, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>·</Text>
                <Text style={[styles.courtInfoName, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>
                  {court.name}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Month name */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)} style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={[styles.monthText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{activeMonth}</Text>
        </Animated.View>

        {/* Date picker pills */}
        <Animated.View entering={FadeInDown.duration(300).delay(150)} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datePillsRow}>
              {dateOptions.map((opt) => {
                const isActive = selectedDate === opt.date;
                return (
                  <Pressable
                    key={opt.date}
                    onPress={() => handleDateSelect(opt)}
                    style={[
                      styles.datePill,
                      {
                        backgroundColor: isActive ? Colors.primary : isDark ? Colors.surfaceDark : Colors.surface,
                        borderColor: isActive ? Colors.primary : isDark ? Colors.borderDark : Colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.datePillDay, { color: isActive ? '#0F172A' : isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
                      {opt.dayName}
                    </Text>
                    <Text style={[styles.datePillNumber, { color: isActive ? '#0F172A' : isDark ? Colors.textDark : Colors.text }]}>
                      {opt.dayNumber}
                    </Text>
                    {opt.isToday && !isActive && (
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 2 }} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Low availability warning */}
        {lowAvailability && (
          <Animated.View entering={FadeIn.duration(300)} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <View style={styles.warningBadge}>
              <Ionicons name="alert-circle" size={16} color="#F59E0B" />
              <Text style={styles.warningText}>Poca disponibilidad — solo {availableCount} horarios disponibles</Text>
            </View>
          </Animated.View>
        )}

        {/* Time grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ paddingHorizontal: 16 }}>
          <Text style={[styles.timeGridTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Horarios disponibles</Text>
          <View style={styles.timeGrid}>
            {mockTimeSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              const isAvailable = slot.available;
              return (
                <Pressable
                  key={slot.time}
                  onPress={() => handleTimeSelect(slot.time, isAvailable)}
                  disabled={!isAvailable}
                  style={[
                    styles.timeCard,
                    {
                      backgroundColor: !isAvailable
                        ? isDark ? 'rgba(30,41,59,0.3)' : 'rgba(241,245,249,0.6)'
                        : isSelected
                        ? Colors.primaryBg
                        : isDark ? Colors.surfaceDark : Colors.surface,
                      borderColor: isSelected ? Colors.primary : isDark ? Colors.borderDark : Colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: !isAvailable ? '#EF4444' : isSelected ? Colors.primary : '#22C55E' }]} />
                  <Text style={[styles.timeCardTime, { color: !isAvailable ? isDark ? Colors.textTertiaryDark : Colors.textTertiary : isDark ? Colors.textDark : Colors.text }]}>
                    {slot.time}
                  </Text>
                  {!isAvailable ? (
                    <Text style={[styles.timeCardSub, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Ocupado</Text>
                  ) : (
                    <Text style={[styles.timeCardSub, { color: Colors.primary }]}>{formatPrice(slot.price)}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Selected time summary */}
        {selectedTimeSlot && selectedSlot && (
          <Animated.View entering={FadeIn.duration(300)} style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 16 }}>
            <GlassCard style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryIcon, { backgroundColor: Colors.primaryBg }]}>
                  <Ionicons name="time" size={20} color={Colors.primary} />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={[styles.summaryDate, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>{selectedDate}</Text>
                  <Text style={[styles.summaryTime, { color: isDark ? Colors.textDark : Colors.text }]}>
                    {selectedTimeSlot} - {parseInt(selectedTimeSlot) + 1}:00
                  </Text>
                </View>
                <Text style={[styles.summaryPrice, { color: Colors.primary }]}>{formatPrice(selectedSlot.price)}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[styles.stickyBottom, { backgroundColor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(248,250,252,0.95)', borderTopColor: isDark ? Colors.borderDark : 'rgba(0,0,0,0.05)' }]}>
        <View style={styles.bottomRow}>
          <View>
            <Text style={[styles.bottomLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Total</Text>
            <Text style={[styles.bottomPrice, { color: isDark ? Colors.textDark : Colors.text }]}>
              {selectedSlot ? formatPrice(selectedSlot.price) : 'S/—'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: selectedTimeSlot ? Colors.primary : isDark ? Colors.surfaceDark : '#E2E8F0' }]}
            onPress={handleContinue}
            disabled={!selectedTimeSlot}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueButtonText, { color: selectedTimeSlot ? '#111' : isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
              Continuar al pago
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 8, borderRadius: 1 },
  courtInfoCard: {},
  courtInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courtInfoText: { fontSize: 14, fontWeight: '600', flex: 1 },
  courtInfoDot: { fontSize: 14 },
  courtInfoName: { fontSize: 13 },
  monthText: { fontSize: 14, fontWeight: '600' },
  datePillsRow: { flexDirection: 'row', gap: 8 },
  datePill: { width: 60, paddingVertical: 10, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  datePillDay: { fontSize: 12, fontWeight: '500' },
  datePillNumber: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  warningBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)',
  },
  warningText: { fontSize: 12, fontWeight: '500', color: '#F59E0B', marginLeft: 6 },
  timeGridTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeCard: {
    width: (SCREEN_WIDTH - 48) / 2 - 5,
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  timeCardTime: { fontSize: 14, fontWeight: 'bold' },
  timeCardSub: { fontSize: 12, marginTop: 4 },
  summaryCard: {},
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  summaryInfo: { flex: 1 },
  summaryDate: { fontSize: 12 },
  summaryTime: { fontSize: 14, fontWeight: 'bold' },
  summaryPrice: { fontSize: 16, fontWeight: '800' },
  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1,
  },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomLabel: { fontSize: 12 },
  bottomPrice: { fontSize: 20, fontWeight: 'bold' },
  continueButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, flex: 1, marginLeft: 16, alignItems: 'center' },
  continueButtonText: { fontSize: 15, fontWeight: '700' },
});
