import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import {
  getComplexById,
  getCourtById,
  formatPrice,
  mockTimeSlots,
} from '@/lib/mock-data';
import { Colors } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';

const COUNTDOWN_SECONDS = 600; // 10 minutes

type PaymentMethod = 'yape' | 'plin' | 'tarjeta' | 'transferencia';

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  icon: string;
  accentColor: string;
}[] = [
  { id: 'yape', name: 'Yape', icon: 'phone-portrait', accentColor: '#7C3AED' },
  { id: 'plin', name: 'Plin', icon: 'wallet', accentColor: '#14B8A6' },
  { id: 'tarjeta', name: 'Tarjeta', icon: 'card', accentColor: '#3B82F6' },
  { id: 'transferencia', name: 'Transferencia', icon: 'swap-horizontal', accentColor: '#F97316' },
];

const PROMO_CODES: Record<string, number> = {
  CANCHA10: 10,
  CANCHA20: 20,
  PRIMERA: 15,
};

export default function CheckoutScreen() {
  const selectedComplexId = useAppStore((s) => s.selectedComplexId);
  const selectedCourtId = useAppStore((s) => s.selectedCourtId);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const selectedTimeSlot = useAppStore((s) => s.selectedTimeSlot);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const appliedPromoCode = useAppStore((s) => s.appliedPromoCode);
  const promoDiscount = useAppStore((s) => s.promoDiscount);
  const applyPromoCode = useAppStore((s) => s.applyPromoCode);
  const removePromoCode = useAppStore((s) => s.removePromoCode);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Countdown
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const [countdownActive, setCountdownActive] = useState(true);

  useEffect(() => {
    if (!countdownActive) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownActive]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progressPercent = remaining / COUNTDOWN_SECONDS;
  const isUrgent = remaining < 120;

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

  const selectedSlot = useMemo(
    () => mockTimeSlots.find((s) => s.time === selectedTimeSlot),
    [selectedTimeSlot]
  );

  const basePrice = selectedSlot?.price ?? 0;
  const igv = Math.round(basePrice * 0.18 * 100) / 100;
  const discountAmount = promoDiscount > 0 ? Math.round(basePrice * (promoDiscount / 100) * 100) / 100 : 0;
  const total = basePrice + igv - discountAmount;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      applyPromoCode(code);
      setPromoError('');
    } else {
      setPromoError('Código inválido');
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoInput('');
    setPromoError('');
  };

  const handleConfirm = () => {
    if (!paymentMethod) return;
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 2500);
    }, 1500);
  };

  const theme = isDarkMode ? Colors.dark : Colors.light;
  const cardBg = isDarkMode ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.75)';
  const borderClr = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)';

  // Success animation values
  const checkScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (showSuccess) {
      checkScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      textOpacity.value = withTiming(1, { duration: 600 });
    }
  }, [showSuccess]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (showSuccess) {
    return (
      <View style={styles.successOverlay}>
        <Animated.View style={[styles.successCheck, checkAnimatedStyle]}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.neonGreen} />
        </Animated.View>
        <Animated.View style={textAnimatedStyle}>
          <Text className="text-2xl font-bold text-white mt-4">
            ¡Reserva Confirmada!
          </Text>
          <Text className="text-base text-gray-300 mt-2 text-center">
            Tu reserva ha sido procesada exitosamente
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header + Stepper */}
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row items-center gap-3 mb-4">
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={theme.text} />
              </Pressable>
              <Text className="text-xl font-bold flex-1" style={{ color: theme.text }}>
                Pago
              </Text>
            </View>

            {/* Stepper: Detalle ✓ → Pago ✓ → Confirmación ○ */}
            <View style={styles.stepper}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: Colors.neonGreen }]}>
                  <Ionicons name="checkmark" size={16} color="#0F172A" />
                </View>
                <Text className="text-xs font-medium mt-1" style={{ color: Colors.neonGreen }}>
                  Detalle
                </Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: Colors.neonGreen }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: Colors.neonGreen }]}>
                  <Ionicons name="checkmark" size={16} color="#0F172A" />
                </View>
                <Text className="text-xs font-medium mt-1" style={{ color: Colors.neonGreen }}>
                  Pago
                </Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]} />
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
                  Confirmación
                </Text>
              </View>
            </View>
          </View>

          {/* Countdown Timer */}
          <Animated.View entering={FadeIn.duration(300)} className="px-4 mb-4">
            <GlassCard isDark={isDarkMode}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm" style={{ color: theme.textSecondary }}>
                  Tiempo para completar:
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{
                    color: isUrgent ? '#EF4444' : theme.text,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
              </View>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    borderRadius: 2,
                    width: `${progressPercent * 100}%`,
                    backgroundColor: isUrgent ? '#EF4444' : Colors.neonGreen,
                  }}
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Order Summary */}
          <Animated.View entering={FadeInDown.duration(300).delay(100)} className="px-4 mb-4">
            <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>
              Resumen de reserva
            </Text>
            <GlassCard isDark={isDarkMode}>
              <View className="gap-3">
                {complex && (
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="location" size={18} color={Colors.neonGreen} />
                    <Text className="text-sm flex-1" style={{ color: theme.textSecondary }} numberOfLines={1}>
                      {complex.name}
                    </Text>
                  </View>
                )}
                {court && (
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="american-football" size={18} color={Colors.neonGreen} />
                    <Text className="text-sm flex-1" style={{ color: theme.textSecondary }} numberOfLines={1}>
                      {court.name}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center gap-3">
                  <Ionicons name="calendar" size={18} color={Colors.neonGreen} />
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>
                    {selectedDate}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="time" size={18} color={Colors.neonGreen} />
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>
                    {selectedTimeSlot} - {selectedTimeSlot ? parseInt(selectedTimeSlot) + 1 : '?'}:00
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Ionicons name="hourglass" size={18} color={Colors.neonGreen} />
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>
                    1 hora
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Price Breakdown */}
          <Animated.View entering={FadeInDown.duration(300).delay(200)} className="px-4 mb-4">
            <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>
              Desglose de precio
            </Text>
            <GlassCard isDark={isDarkMode}>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>
                    Subtotal
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: theme.text }}>
                    {formatPrice(basePrice)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>
                    IGV (18%)
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: theme.text }}>
                    {formatPrice(igv)}
                  </Text>
                </View>
                {promoDiscount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm" style={{ color: '#22C55E' }}>
                      Descuento ({promoDiscount}%)
                    </Text>
                    <Text className="text-sm font-medium" style={{ color: '#22C55E' }}>
                      -{formatPrice(discountAmount)}
                    </Text>
                  </View>
                )}
                <View style={{ height: 1, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0', marginVertical: 4 }} />
                <View className="flex-row justify-between">
                  <Text className="text-base font-bold" style={{ color: theme.text }}>
                    Total
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: Colors.neonGreen }}>
                    {formatPrice(Math.round(total * 100) / 100)}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Promo Code */}
          <Animated.View entering={FadeInDown.duration(300).delay(250)} className="px-4 mb-4">
            <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>
              Código promocional
            </Text>
            {appliedPromoCode ? (
              <GlassCard isDark={isDarkMode}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="pricetag" size={18} color={Colors.neonGreen} />
                    <Text className="text-sm font-semibold" style={{ color: Colors.neonGreen }}>
                      {appliedPromoCode}
                    </Text>
                    <Text className="text-xs" style={{ color: theme.textSecondary }}>
                      -{promoDiscount}% descuento
                    </Text>
                  </View>
                  <Pressable onPress={handleRemovePromo}>
                    <Ionicons name="close-circle" size={20} color={theme.textMuted} />
                  </Pressable>
                </View>
              </GlassCard>
            ) : (
              <View className="flex-row gap-2">
                <TextInput
                  value={promoInput}
                  onChangeText={(t) => {
                    setPromoInput(t);
                    setPromoError('');
                  }}
                  placeholder="Ingresa tu código"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="characters"
                  style={[
                    styles.promoInput,
                    {
                      backgroundColor: isDarkMode ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)',
                      borderColor: promoError ? '#EF4444' : isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      color: theme.text,
                    },
                  ]}
                />
                <Pressable
                  onPress={handleApplyPromo}
                  style={[styles.promoButton, { backgroundColor: Colors.neonGreen }]}
                >
                  <Text className="text-sm font-bold" style={{ color: '#0F172A' }}>
                    Aplicar
                  </Text>
                </Pressable>
              </View>
            )}
            {promoError ? (
              <Text className="text-xs mt-1.5" style={{ color: '#EF4444' }}>
                {promoError}
              </Text>
            ) : null}
          </Animated.View>

          {/* Payment Methods */}
          <Animated.View entering={FadeInDown.duration(300).delay(300)} className="px-4 mb-4">
            <Text className="text-base font-bold mb-3" style={{ color: theme.text }}>
              Método de pago
            </Text>
            <View className="gap-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <Pressable
                    key={method.id}
                    onPress={() => setPaymentMethod(method.id)}
                    style={[
                      styles.paymentCard,
                      {
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? 'rgba(57,255,20,0.06)'
                            : 'rgba(57,255,20,0.04)'
                          : isDarkMode
                          ? 'rgba(30,41,59,0.5)'
                          : 'rgba(255,255,255,0.6)',
                        borderColor: isSelected ? Colors.neonGreen : isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        ...(isSelected
                          ? {
                              shadowColor: Colors.neonGreen,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.25,
                              shadowRadius: 10,
                              elevation: 4,
                            }
                          : {}),
                      },
                    ]}
                  >
                    <View className="flex-row items-center gap-3">
                      {/* Radio indicator */}
                      <View
                        style={[
                          styles.radioOuter,
                          {
                            borderColor: isSelected ? Colors.neonGreen : isDarkMode ? 'rgba(255,255,255,0.2)' : '#CBD5E1',
                          },
                        ]}
                      >
                        {isSelected && (
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: Colors.neonGreen,
                            }}
                          />
                        )}
                      </View>

                      {/* Icon */}
                      <View
                        style={[
                          styles.paymentIcon,
                          { backgroundColor: `${method.accentColor}18` },
                        ]}
                      >
                        <Ionicons name={method.icon as any} size={22} color={method.accentColor} />
                      </View>

                      {/* Name */}
                      <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                        {method.name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Security Badge */}
          <Animated.View entering={FadeInDown.duration(300).delay(350)} className="px-4 mb-4">
            <View className="flex-row items-center justify-center gap-2 py-3">
              <Ionicons name="lock-closed" size={16} color={theme.textMuted} />
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                Pago seguro · Tus datos están protegidos
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View
          style={[
            styles.stickyBottom,
            {
              backgroundColor: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(248,250,252,0.95)',
              borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            },
          ]}
        >
          <View className="flex-row gap-3">
            <View className="flex-1">
              <NeonButton
                title="Cancelar"
                onPress={() => router.back()}
                variant="outline"
                size="lg"
              />
            </View>
            <View style={{ flex: 2 }}>
              <NeonButton
                title="Confirmar Reserva"
                onPress={handleConfirm}
                disabled={!paymentMethod || confirming}
                loading={confirming}
                size="lg"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  promoInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  promoButton: {
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  successOverlay: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheck: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
});
