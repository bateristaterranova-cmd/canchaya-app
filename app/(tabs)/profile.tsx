import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import { mockComplexes, formatPrice, getCourtTypeLabel } from '../../lib/mock-data';
import { Colors, Shadows } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

// ─── Menu items configuration ─────────────────────────────────────────────────
const menuItems = [
  { id: 'favorites', icon: 'heart', label: 'Favoritos', color: '#EF4444' },
  { id: 'reservations', icon: 'calendar', label: 'Mis Reservas', color: '#3B82F6' },
  { id: 'payments', icon: 'card', label: 'Pagos', color: '#8B5CF6' },
  { id: 'notifications', icon: 'notifications', label: 'Notificaciones', color: '#F59E0B' },
  { id: 'settings', icon: 'settings', label: 'Configuración', color: '#64748B' },
  { id: 'help', icon: 'help-circle', label: 'Ayuda y Soporte', color: '#14B8A6' },
] as const;

// ─── Achievement data for the grid ────────────────────────────────────────────
const achievementData = [
  { icon: '🏆', title: 'Primera Reserva', unlocked: true },
  { icon: '🎯', title: 'Cinco Reservas', unlocked: false },
  { icon: '🧭', title: 'Explorador', unlocked: false },
  { icon: '❤️', title: 'Fan Favorito', unlocked: false },
  { icon: '🌅', title: 'Madrugador', unlocked: true },
  { icon: '✍️', title: 'Reseñador', unlocked: false },
];

// ─── Loyalty benefits ─────────────────────────────────────────────────────────
const benefits = [
  { icon: 'pricetag', text: '10% descuento en todas las reservas', unlocked: true },
  { icon: 'flash', text: 'Acceso prioritario a nuevas canchas', unlocked: true },
  { icon: 'gift', text: '1 hora gratis cada 10 reservas', unlocked: false },
  { icon: 'star', text: 'Reseñas con doble puntos', unlocked: false },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user,
    isDarkMode,
    toggleDarkMode,
    logout,
    achievements,
    favorites,
    reservations,
  } = useAppStore();
  const isDark = isDarkMode;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone);
    }
  }, [user]);

  if (!user) return null;

  const completedReservations = reservations.filter((r) => r.status === 'completed').length;
  const totalPoints = completedReservations * 250 + 250;
  const currentTier = totalPoints >= 2000 ? 'Oro' : totalPoints >= 750 ? 'Plata' : 'Bronce';
  const nextTierPoints = currentTier === 'Oro' ? 5000 : currentTier === 'Plata' ? 2000 : 750;
  const progressToNext = Math.min((totalPoints / nextTierPoints) * 100, 100);

  const favoriteComplexes = favorites
    .map((id) => mockComplexes.find((c) => c.id === id))
    .filter(Boolean);

  const handleMenuItemPress = (id: string) => {
    switch (id) {
      case 'favorites':
        setShowFavoritesModal(true);
        break;
      case 'reservations':
        router.navigate('/(tabs)/activity');
        break;
      case 'settings':
        // Navigate within profile or show modal
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 12 }]}
      >
        {/* ── Avatar Section ───────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarRing, { borderColor: Colors.primary }]}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
            </View>
            <TouchableOpacity
              style={[styles.editBadge, { backgroundColor: Colors.primary }]}
              onPress={() => setShowEditProfile(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={14} color="#111" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: isDark ? Colors.textDark : Colors.text }]}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
            {user.email}
          </Text>
          <Text style={[styles.userPhone, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
            {user.phone}
          </Text>
        </Animated.View>

        {/* ── Contact Info Section ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <GlassCard style={styles.contactCard}>
            <View style={styles.contactRow}>
              <View style={[styles.contactIcon, { backgroundColor: Colors.primaryBg }]}>
                <Ionicons name="mail-outline" size={18} color={Colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Correo</Text>
                <Text style={[styles.contactValue, { color: isDark ? Colors.textDark : Colors.text }]}>{user.email}</Text>
              </View>
            </View>
            <View style={[styles.contactDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.contactRow}>
              <View style={[styles.contactIcon, { backgroundColor: Colors.primaryBg }]}>
                <Ionicons name="call-outline" size={18} color={Colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Teléfono</Text>
                <Text style={[styles.contactValue, { color: isDark ? Colors.textDark : Colors.text }]}>{user.phone}</Text>
              </View>
            </View>
            <View style={[styles.contactDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.contactRow}>
              <View style={[styles.contactIcon, { backgroundColor: Colors.primaryBg }]}>
                <Ionicons name="location-outline" size={18} color={Colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Ubicación</Text>
                <Text style={[styles.contactValue, { color: isDark ? Colors.textDark : Colors.text }]}>Lima, Perú</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ── Loyalty Program Section ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <GlassCard style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeader}>
              <View style={styles.loyaltyTitleRow}>
                <Ionicons name="ribbon" size={22} color={Colors.primary} />
                <Text style={[styles.loyaltyTitle, { color: isDark ? Colors.textDark : Colors.text }]}>
                  Programa de Lealtad
                </Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: Colors.primaryBg }]}>
                <Text style={[styles.tierBadgeText, { color: Colors.primaryDark }]}>
                  {currentTier}
                </Text>
              </View>
            </View>

            <View style={styles.pointsRow}>
              <Text style={[styles.pointsLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                Puntos acumulados
              </Text>
              <Text style={[styles.pointsValue, { color: Colors.primary }]}>
                {totalPoints.toLocaleString()} pts
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBg, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]}>
                <View style={[styles.progressFill, { width: `${progressToNext}%`, backgroundColor: Colors.primary }]} />
              </View>
              <Text style={[styles.progressLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
                {totalPoints} / {nextTierPoints} pts para {currentTier === 'Oro' ? 'Diamante' : currentTier === 'Plata' ? 'Oro' : 'Plata'}
              </Text>
            </View>

            <View style={styles.benefitsContainer}>
              {benefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <View style={[styles.benefitIcon, { backgroundColor: benefit.unlocked ? Colors.primaryBg : 'rgba(148,163,184,0.1)' }]}>
                    <Ionicons
                      name={benefit.icon as any}
                      size={16}
                      color={benefit.unlocked ? Colors.primary : '#94A3B8'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.benefitText,
                      {
                        color: benefit.unlocked
                          ? isDark ? Colors.textDark : Colors.text
                          : isDark ? Colors.textTertiaryDark : Colors.textTertiary,
                      },
                    ]}
                  >
                    {benefit.text}
                  </Text>
                  {benefit.unlocked && (
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                  )}
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* ── Achievements Grid ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>
            Logros
          </Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((ach) => (
              <GlassCard
                key={ach.id}
                style={[
                  styles.achievementCard,
                  ach.unlocked && styles.achievementUnlocked,
                ]}
                padding={10}
              >
                <Text style={styles.achievementIcon}>{ach.icon}</Text>
                <Text
                  style={[
                    styles.achievementTitle,
                    {
                      color: ach.unlocked
                        ? Colors.primary
                        : isDark ? Colors.textTertiaryDark : Colors.textTertiary,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {ach.title}
                </Text>
                <View style={styles.achievementProgressRow}>
                  <View style={[styles.achievementProgressBg, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]}>
                    <View
                      style={[
                        styles.achievementProgressFill,
                        {
                          width: `${(ach.progress / ach.maxProgress) * 100}%`,
                          backgroundColor: ach.unlocked ? Colors.primary : '#CBD5E1',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.achievementProgressText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
                    {ach.progress}/{ach.maxProgress}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>
        </Animated.View>

        {/* ── Menu Items ───────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={[styles.sectionTitle, { color: isDark ? Colors.textDark : Colors.text }]}>
            Opciones
          </Text>
          <GlassCard style={styles.menuCard} padding={4}>
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuItemPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={[styles.menuLabel, { color: isDark ? Colors.textDark : Colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                </TouchableOpacity>
                {idx < menuItems.length - 1 && (
                  <View style={[styles.menuDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </GlassCard>
        </Animated.View>

        {/* ── Dark Mode Toggle ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <GlassCard style={styles.darkModeCard}>
            <View style={styles.darkModeRow}>
              <View style={styles.darkModeLeft}>
                <View style={[styles.darkModeIcon, { backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : Colors.primaryBg }]}>
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={20}
                    color={isDark ? '#FBBF24' : Colors.primary}
                  />
                </View>
                <Text style={[styles.darkModeLabel, { color: isDark ? Colors.textDark : Colors.text }]}>
                  Modo Oscuro
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#E2E8F0', true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* ── Logout Button ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: Colors.error }]}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
          CanchaYa v1.0.0
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Logout Confirmation Modal ──────────────────────────────────── */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="log-out-outline" size={36} color={Colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.textDark : Colors.text }]}>
              ¿Cerrar sesión?
            </Text>
            <Text style={[styles.modalMessage, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              Tendrás que iniciar sesión de nuevo para acceder a tu cuenta
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: isDark ? Colors.borderDark : Colors.border }]}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonCancelText, { color: isDark ? Colors.textDark : Colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.error }]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonConfirmText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* ── Favorites Modal ────────────────────────────────────────────── */}
      <Modal visible={showFavoritesModal} transparent animationType="slide" onRequestClose={() => setShowFavoritesModal(false)}>
        <View style={[styles.favoritesModalContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
          <View style={styles.favoritesHeader}>
            <Text style={[styles.favoritesTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Mis Favoritos</Text>
            <TouchableOpacity onPress={() => setShowFavoritesModal(false)} style={styles.favoritesClose}>
              <Ionicons name="close" size={24} color={isDark ? Colors.textDark : Colors.text} />
            </TouchableOpacity>
          </View>
          {favoriteComplexes.length === 0 ? (
            <View style={styles.favoritesEmpty}>
              <Ionicons name="heart-outline" size={48} color={Colors.textTertiary} />
              <Text style={[styles.favoritesEmptyText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                Aún no tienes favoritos
              </Text>
            </View>
          ) : (
            <FlatList
              data={favoriteComplexes}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={styles.favoritesList}
              renderItem={({ item }: { item: any }) => (
                <GlassCard style={styles.favoriteItem} padding={10}>
                  <Image source={{ uri: item.image }} style={styles.favoriteImage} contentFit="cover" />
                  <View style={styles.favoriteInfo}>
                    <Text style={[styles.favoriteName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.favoriteDistrictRow}>
                      <Ionicons name="location" size={13} color={Colors.primary} />
                      <Text style={[styles.favoriteDistrict, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                        {item.district}
                      </Text>
                    </View>
                    <Text style={styles.favoritePrice}>{formatPrice(item.minPrice)}/h</Text>
                  </View>
                </GlassCard>
              )}
            />
          )}
        </View>
      </Modal>

      {/* ── Edit Profile Modal ─────────────────────────────────────────── */}
      <Modal visible={showEditProfile} transparent animationType="slide" onRequestClose={() => setShowEditProfile(false)}>
        <View style={[styles.editModalContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
          <View style={styles.editHeader}>
            <Text style={[styles.editTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setShowEditProfile(false)} style={styles.editClose}>
              <Ionicons name="close" size={24} color={isDark ? Colors.textDark : Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.editForm}>
            <View style={styles.editAvatarSection}>
              <View style={[styles.editAvatarRing, { borderColor: Colors.primary }]}>
                <Image source={{ uri: user.avatar }} style={styles.editAvatar} contentFit="cover" />
              </View>
              <TouchableOpacity style={[styles.editAvatarBadge, { backgroundColor: Colors.primary }]}>
                <Ionicons name="camera" size={16} color="#111" />
              </TouchableOpacity>
            </View>

            <View style={styles.editField}>
              <Text style={[styles.editFieldLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Nombre completo</Text>
              <TextInput
                style={[styles.editFieldInput, { color: isDark ? Colors.textDark : Colors.text, borderColor: isDark ? Colors.borderDark : Colors.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Tu nombre"
                placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
              />
            </View>

            <View style={styles.editField}>
              <Text style={[styles.editFieldLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Correo electrónico</Text>
              <TextInput
                style={[styles.editFieldInput, { color: isDark ? Colors.textDark : Colors.text, borderColor: isDark ? Colors.borderDark : Colors.border }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Tu correo"
                placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.editField}>
              <Text style={[styles.editFieldLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>Teléfono</Text>
              <TextInput
                style={[styles.editFieldInput, { color: isDark ? Colors.textDark : Colors.text, borderColor: isDark ? Colors.borderDark : Colors.border }]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Tu teléfono"
                placeholderTextColor={isDark ? Colors.textTertiaryDark : Colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.editSaveButton, { backgroundColor: Colors.primary }]}
              onPress={() => setShowEditProfile(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.editSaveButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },

  // Avatar
  avatarSection: { alignItems: 'center', paddingTop: 8, paddingBottom: 16 },
  avatarContainer: { position: 'relative' },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 94, height: 94, borderRadius: 47, backgroundColor: '#E2E8F0' },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  userEmail: { fontSize: 14, marginTop: 2 },
  userPhone: { fontSize: 14, marginTop: 2 },

  // Contact info
  contactCard: { marginBottom: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 11, fontWeight: '500' },
  contactValue: { fontSize: 14, fontWeight: '600', marginTop: 1 },
  contactDivider: { height: 1, marginLeft: 48 },

  // Loyalty
  loyaltyCard: { marginBottom: 16 },
  loyaltyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  loyaltyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loyaltyTitle: { fontSize: 17, fontWeight: '700' },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tierBadgeText: { fontSize: 12, fontWeight: '700' },
  pointsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pointsLabel: { fontSize: 13 },
  pointsValue: { fontSize: 16, fontWeight: '800' },
  progressContainer: { marginBottom: 16 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, marginTop: 4 },
  benefitsContainer: { gap: 8 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  benefitIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, fontSize: 13, fontWeight: '500' },

  // Achievements
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  achievementCard: { width: '31%', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6 },
  achievementUnlocked: { borderWidth: 1, borderColor: `${Colors.primary}40` },
  achievementIcon: { fontSize: 24, marginBottom: 4 },
  achievementTitle: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginBottom: 4, lineHeight: 13 },
  achievementProgressRow: { width: '100%', alignItems: 'center', gap: 2 },
  achievementProgressBg: { width: '100%', height: 3, borderRadius: 2, overflow: 'hidden' },
  achievementProgressFill: { height: '100%', borderRadius: 2 },
  achievementProgressText: { fontSize: 9 },

  // Menu
  menuCard: { marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  menuDivider: { height: 1, marginLeft: 48 },

  // Dark mode
  darkModeCard: { marginBottom: 16 },
  darkModeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  darkModeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  darkModeIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  darkModeLabel: { fontSize: 15, fontWeight: '500' },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: Colors.error },
  versionText: { fontSize: 12, textAlign: 'center', marginTop: 20 },

  // Logout Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 340, alignItems: 'center' },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalMessage: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalButtonCancel: { borderWidth: 1.5, backgroundColor: 'transparent' },
  modalButtonCancelText: { fontSize: 15, fontWeight: '600' },
  modalButtonConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Favorites Modal
  favoritesModalContainer: { flex: 1, marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  favoritesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  favoritesTitle: { fontSize: 20, fontWeight: '800' },
  favoritesClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  favoritesEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  favoritesEmptyText: { fontSize: 14, fontWeight: '500' },
  favoritesList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 10 },
  favoriteItem: { flexDirection: 'row', gap: 12 },
  favoriteImage: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#E2E8F0' },
  favoriteInfo: { flex: 1, justifyContent: 'center', gap: 2 },
  favoriteName: { fontSize: 14, fontWeight: '700' },
  favoriteDistrictRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  favoriteDistrict: { fontSize: 12 },
  favoritePrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Edit Profile Modal
  editModalContainer: { flex: 1, marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  editTitle: { fontSize: 20, fontWeight: '800' },
  editClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  editForm: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  editAvatarSection: { alignItems: 'center', marginBottom: 24, position: 'relative' },
  editAvatarRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, padding: 3, justifyContent: 'center', alignItems: 'center' },
  editAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: '35%', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  editField: { marginBottom: 16 },
  editFieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  editFieldInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  editSaveButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  editSaveButtonText: { color: '#111', fontSize: 16, fontWeight: '700' },
});
