import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated as RNAnimated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeInView } from '../components/FadeInView';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import {
  getComplexById,
  getCourtById,
  formatPrice,
  mockTimeSlots,
} from '../lib/mock-data';
import { Colors, Shadows } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';

const COUNTDOWN_SECONDS = 600;

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
  const isDark = isDarkMode;
  const insets = useSafeAreaInsets();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
        router.replace('/(tabs)');
      }, 2500);
    }, 1500);
  };

  const checkScale = useRef(new RNAnimated.Value(0)).current;
  const textOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (showSuccess) {
      RNAnimated.spring(checkScale, { toValue: 1, damping: 8, stiffness: 100, useNativeDriver: true }).start();
      RNAnimated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [showSuccess]);

  if (showSuccess) {
    return (
      <View style={styles.successOverlay}>
        <RNAnimated.View style={[styles.successCheck, { transform: [{ scale: checkScale }] }, { shadowColor: Colors.primary, shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 10 }]}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
        </RNAnimated.View>
        <RNAnimated.View style={{ opacity: textOpacity }}>
          <Text style={styles.successTitle}>¡Reserva Confirmada!</Text>
          <Text style={styles.successSub}>Tu reserva ha sido procesada exitosamente</Text>
        </RNAnimated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header + Stepper */}
          <View style={{ paddingHorizontal: 16, paddingTop: (insets.top || 12) + 4, paddingBottom: 8 }}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={isDark ? Colors.textDark : Colors.text} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Pago</Text>
            </View>
            <View style={styles.stepper}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: Colors.primary }]}>
                  <Ionicons name="checkmark" size={16} color="#0F172A" />
                </View>
                <Text style={[styles.stepText, { color: Colors.primary }]}>Detalle</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: Colors.primary }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: Colors.primary }]}>
                  <Ionicons name="checkmark" size={16} color="#0F172A" />
                </View>
                <Text style={[styles.stepText, { color: Colors.primary }]}>Pago</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: isDark ? Colors.borderDark : '#E2E8F0' }]} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { borderWidth: 2, borderColor: isDark ? Colors.borderDark : '#CBD5E1' }]}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: isDark ? Colors.borderDark : '#CBD5E1' }} />
                </View>
                <Text style={[styles.stepText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Confirmación</Text>
              </View>
            </View>
          </View>

          {/* Countdown Timer */}
          <FadeInView type="fadeIn" duration={300} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <GlassCard style={styles.countdownCard}>
              <View style={styles.countdownRow}>
                <Text style={[styles.countdownLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Tiempo para completar:</Text>
                <Text style={[styles.countdownTime, { color: isUrgent ? '#EF4444' : isDark ? Colors.textDark : Colors.text }]}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </Text>
              </View>
              <View style={[styles.countdownProgressBg, { backgroundColor: isDark ? Colors.borderDark : '#E2E8F0' }]}>
                <View style={[styles.countdownProgressFill, { width: `${progressPercent * 100}%`, backgroundColor: isUrgent ? '#EF4444' : Colors.primary }]} />
              </View>
            </GlassCard>
          </FadeInView>

          {/* Order Summary */}
          <FadeInView type="fadeInDown" duration={300} delay={100} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Resumen de reserva</Text>
            <GlassCard style={styles.summaryCard}>
              <View style={styles.summaryItems}>
                {complex && (
                  <View style={styles.summaryItem}>
                    <Ionicons name="location" size={18} color={Colors.primary} />
                    <Text style={[styles.summaryItemText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>{complex.name}</Text>
                  </View>
                )}
                {court && (
                  <View style={styles.summaryItem}>
                    <Ionicons name="american-football" size={18} color={Colors.primary} />
                    <Text style={[styles.summaryItemText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>{court.name}</Text>
                  </View>
                )}
                <View style={styles.summaryItem}>
                  <Ionicons name="calendar" size={18} color={Colors.primary} />
                  <Text style={[styles.summaryItemText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{selectedDate}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="time" size={18} color={Colors.primary} />
                  <Text style={[styles.summaryItemText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                    {selectedTimeSlot} - {selectedTimeSlot ? parseInt(selectedTimeSlot) + 1 : '?'}:00
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="hourglass" size={18} color={Colors.primary} />
                  <Text style={[styles.summaryItemText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>1 hora</Text>
                </View>
              </View>
            </GlassCard>
          </FadeInView>

          {/* Price Breakdown */}
          <FadeInView type="fadeInDown" duration={300} delay={200} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Desglose de precio</Text>
            <GlassCard style={styles.priceCard}>
              <View style={styles.priceItems}>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Subtotal</Text>
                  <Text style={[styles.priceValue, { color: isDark ? Colors.textDark : Colors.text }]}>{formatPrice(basePrice)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>IGV (18%)</Text>
                  <Text style={[styles.priceValue, { color: isDark ? Colors.textDark : Colors.text }]}>{formatPrice(igv)}</Text>
                </View>
                {promoDiscount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={{ fontSize: 14, color: '#22C55E' }}>Descuento ({promoDiscount}%)</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#22C55E' }}>-{formatPrice(discountAmount)}</Text>
                  </View>
                )}
                <View style={[styles.priceDivider, { backgroundColor: isDark ? Colors.borderDark : '#E2E8F0' }]} />
                <View style={styles.priceRow}>
                  <Text style={[styles.priceTotalLabel, { color: isDark ? Colors.textDark : Colors.text }]}>Total</Text>
                  <Text style={[styles.priceTotalValue, { color: Colors.primary }]}>{formatPrice(Math.round(total * 100) / 100)}</Text>
                </View>
              </View>
            </GlassCard>
          </FadeInView>

          {/* Promo Code */}
          <FadeInView type="fadeInDown" duration={300} delay={250} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Código promocional</Text>
            {appliedPromoCode ? (
              <GlassCard style={styles.promoAppliedCard}>
                <View style={styles.promoAppliedRow}>
                  <View style={styles.promoAppliedLeft}>
                    <Ionicons name="pricetag" size={18} color={Colors.primary} />
                    <Text style={[styles.promoAppliedCode, { color: Colors.primary }]}>{appliedPromoCode}</Text>
                    <Text style={[styles.promoAppliedDiscount, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>-{promoDiscount}%</Text>
                  </View>
                  <Pressable onPress={handleRemovePromo}>
                    <Ionicons name="close-circle" size={20} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                  </Pressable>
                </View>
              </GlassCard>
            ) : (
              <View style={styles.promoInputRow}>
                <TextInput
                  value={promoInput}
                  onChangeText={(t) => { setPromoInput(t); setPromoError(''); }}
                  placeholder="Ingresa tu código"
                  placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                  autoCapitalize="characters"
                  style={[styles.promoInput, { backgroundColor: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)', borderColor: promoError ? '#EF4444' : isDark ? Colors.borderDark : 'rgba(0,0,0,0.05)', color: isDark ? Colors.textDark : Colors.text }]}
                />
                <Pressable onPress={handleApplyPromo} style={[styles.promoButton, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.promoButtonText}>Aplicar</Text>
                </Pressable>
              </View>
            )}
            {promoError ? <Text style={styles.promoError}>{promoError}</Text> : null}
          </FadeInView>

          {/* Payment Methods */}
          <FadeInView type="fadeInDown" duration={300} delay={300} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Método de pago</Text>
            <View style={styles.paymentMethods}>
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
                          ? Colors.primaryBg
                          : isDark ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.6)',
                        borderColor: isSelected ? Colors.primary : isDark ? Colors.borderDark : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    <View style={styles.paymentCardLeft}>
                      <View style={[styles.radioOuter, { borderColor: isSelected ? Colors.primary : isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }]}>
                        {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary }} />}
                      </View>
                      <View style={[styles.paymentIcon, { backgroundColor: `${method.accentColor}18` }]}>
                        <Ionicons name={method.icon as any} size={22} color={method.accentColor} />
                      </View>
                      <Text style={[styles.paymentName, { color: isDark ? Colors.textDark : Colors.text }]}>{method.name}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </FadeInView>

          {/* Security Badge */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View style={styles.securityRow}>
              <Ionicons name="lock-closed" size={16} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
              <Text style={[styles.securityText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Pago seguro · Tus datos están protegidos</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={[styles.stickyBottom, { backgroundColor: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(248,250,252,0.95)', borderTopColor: isDark ? Colors.borderDark : 'rgba(0,0,0,0.05)' }]}>
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: isDark ? Colors.borderDark : Colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: isDark ? Colors.textDark : Colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: paymentMethod && !confirming ? Colors.primary : isDark ? Colors.surfaceDark : '#E2E8F0' }]}
              onPress={handleConfirm}
              disabled={!paymentMethod || confirming}
              activeOpacity={0.8}
            >
              <Text style={[styles.confirmButtonText, { color: paymentMethod && !confirming ? '#111' : isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
                {confirming ? 'Procesando...' : 'Confirmar Reserva'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  countdownCard: {},
  countdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  countdownLabel: { fontSize: 14 },
  countdownTime: { fontSize: 14, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  countdownProgressBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  countdownProgressFill: { height: '100%', borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  summaryCard: {},
  summaryItems: { gap: 12 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryItemText: { fontSize: 14, flex: 1 },
  priceCard: {},
  priceItems: { gap: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '600' },
  priceDivider: { height: 1, marginVertical: 4 },
  priceTotalLabel: { fontSize: 16, fontWeight: 'bold' },
  priceTotalValue: { fontSize: 18, fontWeight: '800' },
  promoAppliedCard: {},
  promoAppliedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promoAppliedLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoAppliedCode: { fontSize: 14, fontWeight: '700' },
  promoAppliedDiscount: { fontSize: 12 },
  promoInputRow: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1 },
  promoButton: { paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  promoButtonText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  promoError: { fontSize: 12, color: '#EF4444', marginTop: 6 },
  paymentMethods: { gap: 12 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  paymentCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  paymentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  paymentName: { fontSize: 14, fontWeight: '600' },
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  securityText: { fontSize: 12 },
  stickyBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1 },
  bottomButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, backgroundColor: 'transparent' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },
  confirmButton: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { fontSize: 15, fontWeight: '700' },
  successOverlay: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  successCheck: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 16, textAlign: 'center' },
  successSub: { fontSize: 16, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
});
