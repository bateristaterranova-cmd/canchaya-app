import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import { Colors } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

const menuItems = [
  { id: 'favorites', label: 'Mis Favoritos', icon: 'heart-outline', color: Colors.heart },
  { id: 'reservations', label: 'Mis Reservas', icon: 'calendar-outline', color: Colors.primary },
  { id: 'payments', label: 'Métodos de Pago', icon: 'card-outline', color: Colors.info },
  { id: 'notifications', label: 'Notificaciones', icon: 'notifications-outline', color: Colors.warning },
  { id: 'settings', label: 'Configuración', icon: 'settings-outline', color: '#999' },
  { id: 'help', label: 'Ayuda y Soporte', icon: 'help-circle-outline', color: Colors.primaryDark },
];

const stats = [
  { label: 'Reservas', value: 12, max: 20, icon: 'calendar' as const },
  { label: 'Canchas', value: 5, max: 10, icon: 'football' as const },
  { label: 'Horas', value: 18, max: 30, icon: 'time' as const },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode, isAuthenticated, user, toggleDarkMode, logout } = useAppStore();
  const isDark = isDarkMode;

  const handleMenuPress = (id: string) => {
    if (id === 'reservations') {
      router.navigate('/(tabs)/activity' as any);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', style: 'destructive', onPress: logout },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.authGuard, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
        <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.authGuardText, { color: isDark ? Colors.textDark : Colors.text }]}>Inicia sesión para ver tu perfil</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Mi Perfil</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <GlassCard style={styles.profileCard} padding={20}>
            <View style={styles.profileTop}>
              <View style={styles.avatarRing}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: isDark ? Colors.textDark : Colors.text }]}>{user.name}</Text>
                <Text style={[styles.profileEmail, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{user.email}</Text>
                <Text style={[styles.profilePhone, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>{user.phone}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={16} color="#111" />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <GlassCard key={stat.label} style={styles.statCard} padding={12}>
                <View style={styles.statIconRow}>
                  <Ionicons name={stat.icon} size={16} color={Colors.primary} />
                  <Text style={[styles.statValue, { color: isDark ? Colors.textDark : Colors.text }]}>{stat.value}</Text>
                </View>
                <Text style={[styles.statLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{stat.label}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(stat.value / stat.max) * 100}%` }]} />
                </View>
              </GlassCard>
            ))}
          </View>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <GlassCard style={styles.menuCard} padding={4}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress(item.id)} activeOpacity={0.7}>
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: isDark ? Colors.textDark : Colors.text }]}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                </TouchableOpacity>
                {index < menuItems.length - 1 && (
                  <View style={[styles.menuDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Dark Mode Toggle */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <GlassCard style={styles.darkModeCard} padding={14}>
            <View style={styles.darkModeRow}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#FBBF24' : Colors.primary} />
              <Text style={[styles.darkModeLabel, { color: isDark ? Colors.textDark : Colors.text }]}>Modo Oscuro</Text>
              <TouchableOpacity
                style={[styles.toggleTrack, isDark && { backgroundColor: Colors.primary }]}
                onPress={toggleDarkMode}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleThumb, isDark && { transform: [{ translateX: 20 }] }]} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.version, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>CanchaYa v1.1.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  authGuard: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  authGuardText: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  profileCard: { marginBottom: 14 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatarRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: Colors.primary, padding: 3 },
  avatar: { width: '100%', height: '100%', borderRadius: 31 },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileEmail: { fontSize: 13 },
  profilePhone: { fontSize: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  editButtonText: { color: '#111', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: { flex: 1 },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, marginBottom: 6 },
  progressBarBg: { height: 4, borderRadius: 2, backgroundColor: 'rgba(132,204,22,0.15)' },
  progressBarFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.primary },
  menuCard: { marginBottom: 14 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 10 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  menuDivider: { height: 1, marginLeft: 54 },
  darkModeCard: { marginBottom: 14 },
  darkModeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  darkModeLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  toggleTrack: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#DDD', padding: 4, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.error, marginBottom: 20 },
  logoutText: { color: Colors.error, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, marginBottom: 20 },
});
