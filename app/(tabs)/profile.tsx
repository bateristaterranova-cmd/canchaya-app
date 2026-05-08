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
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppStore } from '../../lib/store';
import { mockComplexes, formatPrice, getCourtTypeLabel } from '../../lib/mock-data';
import { Colors } from '../../constants/theme';
import { GlassCard } from '../../components/GlassCard';

// --- Data ---

const menuItems = [
  { id: 'favorites', label: 'Mis Favoritos', icon: 'heart-outline' as const, color: Colors.heart },
  { id: 'reservations', label: 'Mis Reservas', icon: 'calendar-outline' as const, color: Colors.primary },
  { id: 'payments', label: 'Métodos de Pago', icon: 'card-outline' as const, color: Colors.info },
  { id: 'notifications', label: 'Notificaciones', icon: 'notifications-outline' as const, color: Colors.warning },
  { id: 'settings', label: 'Configuración', icon: 'settings-outline' as const, color: '#999' },
  { id: 'help', label: 'Ayuda y Soporte', icon: 'help-circle-outline' as const, color: Colors.primaryDark },
];

const achievements = [
  { id: '1', label: 'Primera Reserva', icon: 'trophy' as const, current: 1, total: 1, completed: true },
  { id: '2', label: 'Cinco Reservas', icon: 'locate' as const, current: 3, total: 5, completed: false },
  { id: '3', label: 'Explorador', icon: 'compass' as const, current: 4, total: 5, completed: false },
  { id: '4', label: 'Fan Favorito', icon: 'heart' as const, current: 2, total: 3, completed: false },
];

const benefits = [
  '10% descuento en reservas',
  'Reservas prioritarias',
  'Soporte VIP',
];

// --- Component ---

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode, isAuthenticated, user, toggleDarkMode, logout, favorites, toggleFavorite, selectComplex, updateUser } = useAppStore();
  const isDark = isDarkMode;

  const displayName = user?.name || 'Carlos Mendoza Ríos';
  const displayEmail = user?.email || 'carlos.mendoza@email.com';
  const displayPhone = user?.phone || '+51 999 888 777';
  const displayAvatar = user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [editPhone, setEditPhone] = useState(displayPhone);

  // Redirect to home when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.navigate('/(tabs)' as any);
    }
  }, [isAuthenticated]);

  // Favorite complexes from mock data
  const favoriteComplexes = mockComplexes.filter(c => favorites.includes(c.id));

  const handleMenuPress = (id: string) => {
    if (id === 'reservations') {
      router.navigate('/(tabs)/activity' as any);
    } else if (id === 'favorites') {
      setShowFavoritesModal(true);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    // Navigate to home tab so the AuthScreen (login) is shown
    router.navigate('/(tabs)' as any);
  };

  const handleComplexPress = (id: string) => {
    selectComplex(id);
    setShowFavoritesModal(false);
    router.push('/detail');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <Text style={[styles.headerTitle, { color: isDark ? Colors.textDark : Colors.text }]}>
            Mi Perfil
          </Text>
        </Animated.View>

        {/* ===== 1. Profile Header Card ===== */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <GlassCard style={styles.sectionCard} padding={0}>
            {/* Avatar centered at top */}
            <View style={styles.profileTopSection}>
              <View style={styles.avatarOuterRing}>
                <View style={styles.avatarInnerRing}>
                  <Image source={{ uri: displayAvatar }} style={styles.avatar} contentFit="cover" />
                </View>
              </View>
              {/* Edit icon on avatar */}
              <TouchableOpacity style={styles.avatarEditBadge} activeOpacity={0.7}>
                <Ionicons name="camera" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Name & Level */}
            <View style={styles.profileCenterInfo}>
              <Text style={[styles.profileName, { color: isDark ? Colors.textDark : Colors.text }]}>
                {displayName}
              </Text>
              <View style={styles.levelRow}>
                <View style={styles.levelBadge}>
                  <Ionicons name="medal" size={13} color="#CD7F32" />
                  <Text style={styles.levelBadgeText}>Nivel Bronce</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Ionicons name="star" size={12} color={Colors.star} />
                  <Text style={styles.pointsBadgeText}>1,250 pts</Text>
                </View>
              </View>
            </View>

            {/* Contact info */}
            <View style={[styles.contactSection, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }]}>
              <View style={styles.contactItem}>
                <View style={[styles.contactIconWrap, { backgroundColor: isDark ? 'rgba(132,204,22,0.12)' : 'rgba(132,204,22,0.1)' }]}>
                  <Ionicons name="mail-outline" size={15} color={Colors.primary} />
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[styles.contactLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Correo</Text>
                  <Text style={[styles.contactValue, { color: isDark ? Colors.textDark : Colors.text }]}>{displayEmail}</Text>
                </View>
              </View>
              <View style={[styles.contactDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
              <View style={styles.contactItem}>
                <View style={[styles.contactIconWrap, { backgroundColor: isDark ? 'rgba(132,204,22,0.12)' : 'rgba(132,204,22,0.1)' }]}>
                  <Ionicons name="call-outline" size={15} color={Colors.primary} />
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[styles.contactLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Teléfono</Text>
                  <Text style={[styles.contactValue, { color: isDark ? Colors.textDark : Colors.text }]}>{displayPhone}</Text>
                </View>
              </View>
            </View>

            {/* Edit profile button */}
            <View style={styles.editButtonWrap}>
              <TouchableOpacity style={styles.editButton} activeOpacity={0.8} onPress={() => { setEditName(displayName); setEditPhone(displayPhone); setShowEditModal(true); }}>
                <Ionicons name="create-outline" size={16} color="#111" />
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ===== 2. Loyalty Program Section ===== */}
        <Animated.View entering={FadeInDown.duration(400).delay(225)}>
          <GlassCard style={styles.sectionCard} padding={16}>
            <View style={styles.loyaltyTierRow}>
              <Ionicons name="trophy" size={20} color={Colors.star} />
              <Text style={[styles.loyaltyTierLabel, { color: isDark ? Colors.textDark : Colors.text }]}>Plata</Text>
            </View>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsValue}>1,250</Text>
              <Text style={[styles.pointsLabel, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>puntos</Text>
            </View>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Progreso a Oro</Text>
              <Text style={[styles.progressSub, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>1,750 pts más</Text>
            </View>
            <View style={styles.gradientBarBg}>
              <View style={styles.gradientBarYellow} />
              <View style={styles.gradientBarGreen} />
            </View>
            <View style={styles.benefitsSection}>
              <View style={styles.benefitsHeader}>
                <Ionicons name="gift-outline" size={16} color={Colors.primary} />
                <Text style={[styles.benefitsTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Beneficios actuales</Text>
              </View>
              {benefits.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                  <Text style={[styles.benefitText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>{b}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.historyRow} activeOpacity={0.7}>
              <Ionicons name="stats-chart-outline" size={18} color={Colors.primary} />
              <Text style={[styles.historyLabel, { color: isDark ? Colors.textDark : Colors.text }]}>Historial de puntos</Text>
              <Ionicons name="chevron-forward" size={18} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* ===== 3. Achievements Section ===== */}
        <Animated.View entering={FadeInDown.duration(400).delay(275)}>
          <GlassCard style={styles.sectionCard} padding={16}>
            <View style={styles.achievementsHeader}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleNum}>2/8</Text>
                <Text style={[styles.progressCircleLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>logros</Text>
              </View>
              <View style={styles.achievementsHeaderText}>
                <Text style={[styles.achievementsTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Logros desbloqueados</Text>
                <Text style={[styles.achievementsSub, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>¡6 logros más por desbloquear!</Text>
                <View style={styles.overallBarBg}>
                  <View style={[styles.overallBarFill, { width: '25%' }]} />
                </View>
              </View>
            </View>
            <View style={styles.achievementGrid}>
              {achievements.map((ach) => {
                const progress = ach.current / ach.total;
                return (
                  <View key={ach.id} style={[styles.achievementCard, { backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }]}>
                    <View style={[styles.achievementIconWrap, { backgroundColor: ach.completed ? Colors.primaryBg : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') }]}>
                      <Ionicons name={ach.icon} size={22} color={ach.completed ? Colors.primary : (isDark ? Colors.textTertiaryDark : Colors.textTertiary)} />
                    </View>
                    <Text style={[styles.achievementLabel, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{ach.label}</Text>
                    <Text style={[styles.achievementProgress, { color: ach.completed ? Colors.primary : (isDark ? Colors.textTertiaryDark : Colors.textTertiary) }]}>{ach.current}/{ach.total}</Text>
                    <View style={styles.achBarBg}>
                      <View style={[styles.achBarFill, { width: `${progress * 100}%`, backgroundColor: ach.completed ? Colors.primary : (isDark ? Colors.textTertiaryDark : Colors.textTertiary) }]} />
                    </View>
                  </View>
                );
              })}
            </View>
            <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>Ver todos los logros (8)</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* ===== 4. Menu Section ===== */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <GlassCard style={styles.sectionCard} padding={4}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: isDark ? Colors.textDark : Colors.text }]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={isDark ? Colors.textTertiaryDark : Colors.textTertiary} />
                </TouchableOpacity>
                {index < menuItems.length - 1 && (
                  <View style={[styles.menuDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
                )}
              </React.Fragment>
            ))}
            <View style={[styles.menuDivider, { backgroundColor: isDark ? Colors.borderDark : Colors.border }]} />
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: (isDark ? '#FBBF24' : Colors.primary) + '15' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={isDark ? '#FBBF24' : Colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? Colors.textDark : Colors.text }]}>Modo Oscuro</Text>
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
        <Animated.View entering={FadeInDown.duration(400).delay(425)}>
          <TouchableOpacity style={[styles.logoutButton, isDark && { backgroundColor: 'rgba(239,68,68,0.1)' }]} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.version, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>
          CanchaYa v1.1.0
        </Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ===== Logout Confirmation Modal ===== */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? Colors.surfaceDark : '#FFF' }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Ionicons name="log-out-outline" size={28} color={Colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Cerrar Sesión</Text>
            <Text style={[styles.modalMessage, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
              ¿Estás seguro de que deseas cerrar sesión?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel, { backgroundColor: isDark ? Colors.surfaceDark : '#F5F5F5' }]} onPress={() => setShowLogoutModal(false)} activeOpacity={0.7}>
                <Text style={[styles.modalBtnCancelText, { color: isDark ? Colors.textDark : Colors.text }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm, { backgroundColor: Colors.error }]} onPress={confirmLogout} activeOpacity={0.7}>
                <Text style={styles.modalBtnConfirmText}>Sí, cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Favorites Modal ===== */}
      <Modal visible={showFavoritesModal} transparent animationType="slide" onRequestClose={() => setShowFavoritesModal(false)}>
        <View style={[styles.favModalContainer, { backgroundColor: isDark ? Colors.backgroundDark : Colors.background }]}>
          <View style={styles.favModalHeader}>
            <Text style={[styles.favModalTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Mis Favoritos</Text>
            <TouchableOpacity onPress={() => setShowFavoritesModal(false)} style={styles.favModalClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={isDark ? Colors.textDark : Colors.text} />
            </TouchableOpacity>
          </View>
          {favoriteComplexes.length === 0 ? (
            <View style={styles.favEmpty}>
              <Ionicons name="heart-outline" size={48} color={Colors.textTertiary} />
              <Text style={[styles.favEmptyTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Sin favoritos</Text>
              <Text style={[styles.favEmptySub, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]}>
                Agrega canchas a favoritos tocando el ícono de corazón
              </Text>
            </View>
          ) : (
            <FlatList
              data={favoriteComplexes}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.favList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const courtTypes = [...new Set(item.courts.map((c: any) => c.type))];
                return (
                  <GlassCard style={styles.favCard} padding={10}>
                    <TouchableOpacity onPress={() => handleComplexPress(item.id)} activeOpacity={0.9} style={styles.favCardRow}>
                      <Image source={{ uri: item.image }} style={styles.favImage} contentFit="cover" />
                      <View style={styles.favInfo}>
                        <Text style={[styles.favName, { color: isDark ? Colors.textDark : Colors.text }]} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.favDistrictRow}>
                          <Ionicons name="location-outline" size={12} color={Colors.primary} />
                          <Text style={[styles.favDistrict, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondary }]} numberOfLines={1}>{item.district}</Text>
                        </View>
                        <View style={styles.favMetaRow}>
                          <View style={styles.favRating}>
                            <Ionicons name="star" size={12} color={Colors.star} />
                            <Text style={styles.favRatingText}>{item.rating}</Text>
                          </View>
                          <Text style={styles.favPrice}>{formatPrice(item.minPrice)}/h</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.favHeartBtn} activeOpacity={0.7}>
                        <Ionicons name="heart" size={24} color={Colors.heart} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </GlassCard>
                );
              }}
            />
          )}
        </View>
      </Modal>

      {/* ===== Edit Profile Modal ===== */}
      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? Colors.surfaceDark : '#FFF' }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: 'rgba(132,204,22,0.1)' }]}>
              <Ionicons name="create-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.textDark : Colors.text }]}>Editar Perfil</Text>

            <View style={styles.editFieldWrap}>
              <Text style={[styles.editFieldLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Nombre</Text>
              <View style={[styles.editFieldInputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F5F5F5', borderColor: isDark ? Colors.borderDark : Colors.border }]}>
                <Ionicons name="person-outline" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.editFieldInput, { color: isDark ? Colors.textDark : Colors.text }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nombre completo"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.editFieldWrap}>
              <Text style={[styles.editFieldLabel, { color: isDark ? Colors.textTertiaryDark : Colors.textTertiary }]}>Teléfono</Text>
              <View style={[styles.editFieldInputWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F5F5F5', borderColor: isDark ? Colors.borderDark : Colors.border }]}>
                <Ionicons name="call-outline" size={16} color={Colors.textTertiary} />
                <TextInput
                  style={[styles.editFieldInput, { color: isDark ? Colors.textDark : Colors.text }]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Teléfono"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel, { backgroundColor: isDark ? Colors.surfaceDark : '#F5F5F5' }]} onPress={() => setShowEditModal(false)} activeOpacity={0.7}>
                <Text style={[styles.modalBtnCancelText, { color: isDark ? Colors.textDark : Colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.primary }]} onPress={() => { updateUser({ name: editName, phone: editPhone }); setShowEditModal(false); }} activeOpacity={0.7}>
                <Text style={styles.modalBtnConfirmText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },


  // Header
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 16 },

  // Section card shared
  sectionCard: { marginBottom: 14, overflow: 'hidden' },

  // === Profile Header ===
  profileTopSection: { alignItems: 'center', paddingTop: 20, paddingBottom: 12, position: 'relative' },
  avatarOuterRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primary, padding: 3, alignItems: 'center', justifyContent: 'center' },
  avatarInnerRing: { width: '100%', height: '100%', borderRadius: 42, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%', borderRadius: 42 },
  avatarEditBadge: { position: 'absolute', bottom: 8, right: '32%', width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  profileCenterInfo: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  profileName: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(205, 127, 50, 0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  levelBadgeText: { fontSize: 12, fontWeight: '600', color: '#CD7F32' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251, 191, 36, 0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pointsBadgeText: { fontSize: 12, fontWeight: '600', color: '#D97706' },
  contactSection: { marginHorizontal: 16, marginBottom: 14, borderRadius: 14, padding: 14 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  contactIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contactTextWrap: { flex: 1 },
  contactLabel: { fontSize: 11, fontWeight: '500' },
  contactValue: { fontSize: 14, fontWeight: '600', marginTop: 1 },
  contactDivider: { height: 1, marginVertical: 4, marginLeft: 48 },
  editButtonWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, paddingVertical: 11, borderRadius: 12 },
  editButtonText: { color: '#111', fontWeight: '700', fontSize: 14 },



  // === Loyalty Program ===
  loyaltyTierRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  loyaltyTierLabel: { fontSize: 16, fontWeight: '700' },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 },
  pointsValue: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  pointsLabel: { fontSize: 14, fontWeight: '500' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressTitle: { fontSize: 13, fontWeight: '600' },
  progressSub: { fontSize: 12 },
  gradientBarBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(132,204,22,0.15)', flexDirection: 'row', overflow: 'hidden', marginBottom: 16 },
  gradientBarYellow: { flex: 0.4, backgroundColor: Colors.star },
  gradientBarGreen: { flex: 0.6, backgroundColor: Colors.primary },
  benefitsSection: { marginBottom: 12 },
  benefitsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  benefitsTitle: { fontSize: 14, fontWeight: '600' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 },
  benefitText: { fontSize: 13 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  historyLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

  // === Achievements ===
  achievementsHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  progressCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  progressCircleNum: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  progressCircleLabel: { fontSize: 9, fontWeight: '600' },
  achievementsHeaderText: { flex: 1, gap: 3 },
  achievementsTitle: { fontSize: 16, fontWeight: '700' },
  achievementsSub: { fontSize: 12 },
  overallBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(132,204,22,0.15)', marginTop: 4 },
  overallBarFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: { width: '47%', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  achievementIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  achievementLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  achievementProgress: { fontSize: 11, fontWeight: '700' },
  achBarBg: { width: '100%', height: 4, borderRadius: 2, backgroundColor: 'rgba(132,204,22,0.15)', marginTop: 4 },
  achBarFill: { height: '100%', borderRadius: 2 },
  viewAllRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 12, marginTop: 4 },
  viewAllText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // === Menu ===
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 10 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  menuDivider: { height: 1, marginLeft: 54 },
  toggleTrack: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#DDD', padding: 4, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },

  // Logout
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.error, marginBottom: 20, backgroundColor: 'transparent' },
  logoutText: { color: Colors.error, fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, marginBottom: 20 },

  // === Logout Modal ===
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 340, borderRadius: 20, padding: 24, alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  modalIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalBtnCancel: {},
  modalBtnCancelText: { fontWeight: '600', fontSize: 15 },
  modalBtnConfirm: {},
  modalBtnConfirmText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  // === Favorites Modal ===
  favModalContainer: { flex: 1, marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  favModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  favModalTitle: { fontSize: 20, fontWeight: '800' },
  favModalClose: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  favList: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  favCard: { marginBottom: 10 },
  favCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  favImage: { width: 70, height: 70, borderRadius: 10 },
  favInfo: { flex: 1, gap: 3 },
  favName: { fontSize: 14, fontWeight: '700' },
  favDistrictRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  favDistrict: { fontSize: 12 },
  favMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  favRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  favRatingText: { fontSize: 12, fontWeight: '700', color: Colors.star },
  favPrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  favHeartBtn: { padding: 8 },
  favEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 40 },
  favEmptyTitle: { fontSize: 18, fontWeight: '700' },
  favEmptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // === Edit Profile Modal ===
  editFieldWrap: { width: '100%', marginBottom: 12 },
  editFieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  editFieldInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  editFieldInput: { flex: 1, height: 44, fontSize: 14 },
});
