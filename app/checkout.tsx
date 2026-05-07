import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

import { useAppStore } from '../lib/store';
import {
  getComplexById,
  formatPrice,
  mockTimeSlots,
} from '../lib/mock-data';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '../constants/theme';
import { GlassCard } from '../components/GlassCard';

const COUNTDOWN_SECONDS = 600; // 10 minutes

interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'yape', label: 'Yape', icon: 'phone-portrait-outline', color: '#7C3AED' },
  { id: 'plin', label: 'Plin', icon: 'flash-outline', color: '#0D9488' },
  { id: 'card', label: 'Tarjeta', icon: 'card-outline', color: '#3B82F6' },
  { id: 'transfer', label: 'Transferencia', icon: 'swap-horizontal-outline', color: '#EA580C' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode, selectedComplexId, selectedCourtId, selectedDate, selectedTimeSlot } = useAppStore();
  const isDark = isDarkMode;

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const complex = getComplexById(selectedComplexId || '');
  const court = complex?.courts.find(c => c.id === selectedCourtId) || complex?.courts[0];
  const timeSlot = mockTimeSlots.find(s => s.time === selectedTimeSlot);
  const price = timeSlot?.price || court?.pricePerHour || 0;
  const serviceFee = Math.round(price * 0.05);
  const totalPrice = price + serviceFee;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownProgress = countdown / COUNTDOWN_SECONDS;
  const isLowTime = countdown < 120;

  const endTime = selectedTimeSlot
    ? `${String(parseInt(selectedTimeSlot.split(':')[0]) + 1).padStart(2, '0')}:00`
    : '';

  const handleConfirm = () => {
    if (!selectedPayment) {
      Alert.alert('Método de pago', 'Selecciona un método de pago para continuar');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/(tabs)');
    }, 2500);
  };

  const handleCancel = () => {
    Alert.alert('Cancelar', '¿Deseas cancelar la reserva?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', style: 'destructive', onPress: () => router.push('/(tabs)') },
    ]);
  };

  // Success animation
  const successScale = useSharedValue(0);
  useEffect(() => {
    if (showSuccess) {
      successScale.value = withSpring(1, { damping: 12 });
    }
  }, [showSuccess]);
  const successStyle = useAnimatedStyle(() => ({ transform: [{ scale: successScale.value }] }));

  if (!complex || !court) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.emptyText, { color: isDark ? Colors.textDark : Colors.text }]}>No se encontró la reserva</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Pago</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepRow}>
            <View style={styles.stepCompleted}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
            <Text style={[styles.stepLabel, { color: Colors.primary }]}>Detalle</Text>
          </View>
          <View style={[styles.stepLine, { backgroundColor: Colors.primary }]} />
          <View style={styles.stepRow}>
            <View style={[styles.stepActive, { borderColor: Colors.primary }]}>
              <Text style={styles.stepActiveNum}>2</Text>
            </View>
            <Text style={[styles.stepLabel, { color: Colors.primary }]}>Pago</Text>
          </View>
          <View style={[styles.stepLine, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
          <View style={styles.stepRow}>
            <View style={[styles.stepPending, { borderColor: isDark ? Colors.borderDark : Colors.border }]}>
              <Text style={[styles.stepPendingNum, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Confirmación</Text>
          </View>
        </View>

        {/* Countdown timer */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <GlassCard style={styles.countdownCard} padding={12}>
            <View style={styles.countdownRow}>
              <Ionicons name="timer-outline" size={18} color={isLowTime ? Colors.error : Colors.primary} />
              <Text style={[styles.countdownLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                Tiempo para completar el pago
              </Text>
            </View>
            <Text style={[styles.countdownTime, { color: isLowTime ? Colors.error : Colors.primary }]}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            <View style={styles.countdownBarBg}>
              <View style={[styles.countdownBarFill, { width: `${countdownProgress * 100}%`, backgroundColor: isLowTime ? Colors.error : Colors.primary }]} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Booking summary */}
        <Animated.View entering={FadeInDown.duration(300).delay(50)}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Resumen de reserva</Text>
          <GlassCard style={styles.summaryCard} padding={14}>
            <View style={styles.summaryItem}>
              <Ionicons name="location-outline" size={16} color={Colors.primary} />
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Complejo</Text>
              <Text style={[styles.summaryValue, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{complex.name}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="football-outline" size={16} color={Colors.primary} />
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Cancha</Text>
              <Text style={[styles.summaryValue, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{court.name}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Fecha</Text>
              <Text style={[styles.summaryValue, { color: isDark ? Colors.textDark : Colors.text }]}>{selectedDate}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Hora</Text>
              <Text style={[styles.summaryValue, { color: isDark ? Colors.textDark : Colors.text }]}>{selectedTimeSlot} - {endTime}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="timer-outline" size={16} color={Colors.primary} />
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Duración</Text>
              <Text style={[styles.summaryValue, { color: isDark ? Colors.textDark : Colors.text }]}>1 hora</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Precio cancha</Text>
              <Text style={[styles.summaryValue, { color: isDark ? Colors.textDark : Colors.text }]}>{formatPrice(price)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Servicio (5%)</Text>
              <Text style={[styles.summaryValue, { color: isDark ? Colors.textDark : Colors.text }]}>{formatPrice(serviceFee)}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.totalLabel, { color: isDark ? Colors.textDark : Colors.text }]}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Payment methods */}
        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Método de pago</Text>
          <View style={styles.paymentGrid}>
            {paymentMethods.map((method) => {
              const isSelected = selectedPayment === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentCard,
                    { borderColor: isSelected ? method.color : (isDark ? Colors.borderDark : Colors.border) },
                    isSelected && { backgroundColor: method.color + '15', shadowColor: method.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
                  ]}
                  onPress={() => setSelectedPayment(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
                    <Ionicons name={method.icon as any} size={20} color={method.color} />
                  </View>
                  <Text style={[styles.paymentLabel, { color: isSelected ? method.color : (isDark ? Colors.textDark : Colors.text) }]}>
                    {method.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.paymentCheck, { backgroundColor: method.color }]}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Promo code */}
        <Animated.View entering={FadeInDown.duration(300).delay(150)}>
          <GlassCard style={styles.promoCard} padding={10}>
            <View style={styles.promoRow}>
              <Ionicons name="pricetag-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={[styles.promoInput, { color: isDark ? Colors.textDark : Colors.text }]}
                placeholder="Código promocional"
                placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <TouchableOpacity style={styles.promoButton} activeOpacity={0.8}>
                <Text style={styles.promoButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Security badge */}
        <Animated.View entering={FadeInDown.duration(300).delay(200)}>
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed-outline" size={14} color={Colors.success} />
            <Text style={styles.securityText}>Pago seguro · Tus datos están protegidos</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <View style={styles.bottomBarInner}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, !selectedPayment && { opacity: 0.5 }]}
            onPress={handleConfirm}
            disabled={!selectedPayment}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#111" />
            <Text style={styles.confirmButtonText}>Confirmar Pago</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Success overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successContent, successStyle]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>¡Reserva Confirmada!</Text>
            <Text style={styles.successSub}>{complex.name}</Text>
            <Text style={styles.successTime}>{selectedDate} · {selectedTimeSlot} - {endTime}</Text>
          </Animated.View>
        </View>
      )}
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

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  backButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(132,204,22,0.1)' },
  headerTitle: { fontSize: 20, fontWeight: '800' },

  // Stepper
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginBottom: 16 },
  stepRow: { alignItems: 'center', gap: 4 },
  stepCompleted: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepActive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepActiveNum: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  stepPending: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepPendingNum: { fontSize: 12, fontWeight: '600' },
  stepLabel: { fontSize: 11, fontWeight: '600' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4 },

  // Countdown
  countdownCard: { marginHorizontal: 16, marginBottom: 12 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  countdownLabel: { fontSize: 12 },
  countdownTime: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 6, fontVariant: ['tabular-nums'] },
  countdownBarBg: { height: 4, borderRadius: 2, backgroundColor: 'rgba(132,204,22,0.15)' },
  countdownBarFill: { height: '100%', borderRadius: 2 },

  // Section title
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, paddingHorizontal: 16 },

  // Summary
  summaryCard: { marginHorizontal: 16, marginBottom: 16 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  summaryLabel: { fontSize: 13, flex: 1 },
  summaryValue: { fontSize: 13, fontWeight: '600', flex: 1.5, textAlign: 'right' },
  summaryDivider: { height: 1 },
  totalLabel: { fontSize: 15, fontWeight: '800', flex: 1 },
  totalValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  // Payment
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  paymentCard: { width: '47%', borderWidth: 2, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, position: 'relative' },
  paymentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  paymentLabel: { fontSize: 13, fontWeight: '700' },
  paymentCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  // Promo
  promoCard: { marginHorizontal: 16, marginBottom: 12 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoInput: { flex: 1, height: 36, fontSize: 13 },
  promoButton: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  promoButtonText: { color: '#111', fontWeight: '700', fontSize: 13 },

  // Security
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 },
  securityText: { fontSize: 12, color: Colors.success, fontWeight: '500' },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 16, paddingTop: 12 },
  bottomBarInner: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.error, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: Colors.error, fontWeight: '700', fontSize: 14 },
  confirmButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12 },
  confirmButtonText: { color: '#111', fontWeight: '700', fontSize: 15 },

  // Success overlay
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  successContent: { alignItems: 'center', gap: 8 },
  successIcon: { marginBottom: 8 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  successSub: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  successTime: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
});
