import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import {
  mockTimeSlots,
  getComplexById,
  getCourtById,
  formatPrice,
} from '@/lib/mock-data';
import { Colors } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';

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

  // Low availability: count available slots
  const availableCount = useMemo(
    () => mockTimeSlots.filter((s) => s.available).length,
    []
  );
  const lowAvailability = availableCount <= 3 && availableCount > 0;

  // Selected slot price
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

  const theme = isDarkMode ? Colors.dark : Colors.light;
  const cardBg = isDarkMode ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.75)';
  const borderClr = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background }}>
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header + Stepper */}
          <View className="px-4 pt-4 pb-2">
            {/* Back button + Title */}
            <View className="flex-row items-center gap-3 mb-4">
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={theme.text} />
              </Pressable>
              <Text className="text-xl font-bold flex-1" style={{ color: theme.text }}>
                Horario
              </Text>
            </View>

            {/* Stepper: Detalle ✓ → Horario ● → Pago ○ */}
            <View style={styles.stepper}>
              {/* Step 1 - Detalle (completed) */}
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: Colors.neonGreen }]}>
                  <Ionicons name="checkmark" size={16} color="#0F172A" />
                </View>
                <Text className="text-xs font-medium mt-1" style={{ color: Colors.neonGreen }}>
                  Detalle
                </Text>
              </View>

              {/* Line 1 */}
              <View style={[styles.stepLine, { backgroundColor: Colors.neonGreen }]} />

              {/* Step 2 - Horario (active) */}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                      borderColor: Colors.neonGreen,
                      shadowColor: Colors.neonGreen,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 8,
                      elevation: 4,
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: Colors.neonGreen,
                    }}
                  />
                </View>
                <Text className="text-xs font-medium mt-1" style={{ color: Colors.neonGreen }}>
                  Horario
                </Text>
              </View>

              {/* Line 2 */}
              <View style={[styles.stepLine, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} />

              {/* Step 3 - Pago (pending) */}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#CBD5E1',
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#CBD5E1',
                    }}
                  />
                </View>
                <Text className="text-xs font-medium mt-1" style={{ color: theme.textMuted }}>
                  Pago
                </Text>
              </View>
            </View>
          </View>

          {/* Court info summary */}
          {complex && court && (
            <Animated.View entering={FadeIn.duration(300)} className="px-4 mb-4">
              <GlassCard isDark={isDarkMode}>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location" size={16} color={Colors.neonGreen} />
                  <Text className="text-sm font-semibold" style={{ color: theme.text }} numberOfLines={1}>
                    {complex.name}
                  </Text>
                  <Text className="text-xs" style={{ color: theme.textMuted }}>
                    ·
                  </Text>
                  <Text className="text-sm" style={{ color: theme.textSecondary }} numberOfLines={1}>
                    {court.name}
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Month name */}
          <Animated.View entering={FadeInDown.duration(300).delay(100)} className="px-4 mb-2">
            <Text className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
              {activeMonth}
            </Text>
          </Animated.View>

          {/* Date picker pills */}
          <Animated.View entering={FadeInDown.duration(300).delay(150)} className="px-4 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {dateOptions.map((opt) => {
                  const isActive = selectedDate === opt.date;
                  return (
                    <Pressable
                      key={opt.date}
                      onPress={() => handleDateSelect(opt)}
                      style={[
                        styles.datePill,
                        {
                          backgroundColor: isActive
                            ? Colors.neonGreen
                            : isDarkMode
                            ? 'rgba(30,41,59,0.7)'
                            : 'rgba(255,255,255,0.75)',
                          borderColor: isActive
                            ? Colors.neonGreen
                            : isDarkMode
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(255,255,255,0.5)',
                        },
                      ]}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: isActive ? '#0F172A' : theme.textMuted }}
                      >
                        {opt.dayName}
                      </Text>
                      <Text
                        className="text-lg font-bold mt-0.5"
                        style={{ color: isActive ? '#0F172A' : theme.text }}
                      >
                        {opt.dayNumber}
                      </Text>
                      {opt.isToday && !isActive && (
                        <View
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: Colors.neonGreen,
                            marginTop: 2,
                          }}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>

          {/* Low availability warning */}
          {lowAvailability && (
            <Animated.View entering={FadeIn.duration(300)} className="px-4 mb-3">
              <View
                style={[
                  styles.warningBadge,
                  { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' },
                ]}
              >
                <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                <Text className="text-xs font-medium ml-1.5" style={{ color: '#F59E0B' }}>
                  Poca disponibilidad — solo {availableCount} horarios disponibles
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Time grid */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-4">
            <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>
              Horarios disponibles
            </Text>
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
                          ? isDarkMode
                            ? 'rgba(30,41,59,0.3)'
                            : 'rgba(241,245,249,0.6)'
                          : isSelected
                          ? 'rgba(57,255,20,0.08)'
                          : isDarkMode
                          ? 'rgba(30,41,59,0.7)'
                          : 'rgba(255,255,255,0.75)',
                        borderColor: isSelected
                          ? Colors.neonGreen
                          : isDarkMode
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.5)',
                        borderWidth: isSelected ? 2 : 1,
                        ...(isSelected
                          ? {
                              shadowColor: Colors.neonGreen,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.3,
                              shadowRadius: 12,
                              elevation: 4,
                            }
                          : {}),
                      },
                    ]}
                  >
                    {/* Status dot */}
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: !isAvailable
                            ? '#EF4444'
                            : isSelected
                            ? Colors.neonGreen
                            : '#22C55E',
                        },
                      ]}
                    />
                    <Text
                      className="text-sm font-bold"
                      style={{
                        color: !isAvailable
                          ? theme.textMuted
                          : theme.text,
                      }}
                    >
                      {slot.time}
                    </Text>
                    {!isAvailable ? (
                      <Text className="text-xs mt-1" style={{ color: theme.textMuted }}>
                        Ocupado
                      </Text>
                    ) : (
                      <Text className="text-xs mt-1" style={{ color: Colors.neonGreen }}>
                        {formatPrice(slot.price)}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Legend */}
          <View className="px-4 mt-4 mb-3">
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  Disponible
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  Ocupado
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  Poca disponibilidad
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing note */}
          <View className="px-4 mb-3">
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              Los precios pueden variar según el horario
            </Text>
          </View>

          {/* Selected time summary */}
          {selectedTimeSlot && selectedSlot && (
            <Animated.View entering={FadeIn.duration(300)} className="px-4 mb-4">
              <GlassCard isDark={isDarkMode}>
                <View className="flex-row items-center gap-3">
                  <View style={[styles.summaryIcon, { backgroundColor: 'rgba(57,255,20,0.12)' }]}>
                    <Ionicons name="time" size={20} color={Colors.neonGreen} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs" style={{ color: theme.textMuted }}>
                      {selectedDate}
                    </Text>
                    <Text className="text-sm font-bold" style={{ color: theme.text }}>
                      {selectedTimeSlot} - {parseInt(selectedTimeSlot) + 1}:00
                    </Text>
                  </View>
                  <Text className="text-base font-bold" style={{ color: Colors.neonGreen }}>
                    {formatPrice(selectedSlot.price)}
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>

        {/* Sticky bottom bar */}
        <View
          style={[
            styles.stickyBottom,
            {
              backgroundColor: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(248,250,252,0.95)',
              borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            },
          ]}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                Total
              </Text>
              <Text className="text-xl font-bold" style={{ color: theme.text }}>
                {selectedSlot ? formatPrice(selectedSlot.price) : 'S/—'}
              </Text>
            </View>
            <View className="flex-1 ml-4">
              <NeonButton
                title="Continuar al pago"
                onPress={handleContinue}
                disabled={!selectedTimeSlot}
                size="lg"
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    borderRadius: 1,
  },
  datePill: {
    width: 60,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeCard: {
    width: (SCREEN_WIDTH - 48) / 2 - 5,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});
