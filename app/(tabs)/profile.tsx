import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import { Colors, GlassShadows, NeonShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';

interface StatItemProps {
  icon: string;
  value: string;
  label: string;
  progress: number;
}

function StatItem({ icon, value, label, progress }: StatItemProps) {
  return (
    <GlassCard style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </GlassCard>
  );
}

interface AchievementCardProps {
  icon: string;
  title: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
}

function AchievementCard({ icon, title, progress, maxProgress, unlocked }: AchievementCardProps) {
  const pct = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
  return (
    <GlassCard style={[styles.achievementCard, unlocked && styles.achievementUnlocked]}>
      <Text style={styles.achievementIcon}>{icon}</Text>
      <Text style={[styles.achievementTitle, unlocked && { color: Colors.neonGreen }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%` },
            unlocked && styles.progressFillUnlocked,
          ]}
        />
      </View>
      <Text style={styles.achievementProgress}>
        {progress}/{maxProgress}
      </Text>
    </GlassCard>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

function MenuItem({ icon, label, onPress, showChevron = true }: MenuItemProps) {
  const chevronX = useSharedValue(0);
  const [pressed, setPressed] = useState(false);

  React.useEffect(() => {
    if (pressed) {
      chevronX.value = withSequence(withTiming(6, { duration: 120 }), withTiming(0, { duration: 120 }));
      setPressed(false);
    }
  }, [pressed]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chevronX.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        setPressed(true);
        onPress();
      }}
      style={styles.menuItem}
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon as any} size={20} color={Colors.neonGreen} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      {showChevron && (
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Animated.View>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const logout = useAppStore((s) => s.logout);
  const achievements = useAppStore((s) => s.achievements);
  const favorites = useAppStore((s) => s.favorites);
  const reservations = useAppStore((s) => s.reservations);

  const router = useRouter();

  // Avatar glow animation
  const glowScale = useSharedValue(1);
  React.useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  if (!user) return null;

  const completedReservations = reservations.filter((r) => r.status === 'completed').length;
  const totalPoints = completedReservations * 250 + 250; // Mock points

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Animated.View style={[styles.avatarGlow, glowStyle]}>
            <LinearGradient
              colors={[Colors.neonGreen, Colors.neonGreenLight, Colors.neonGreenDark]}
              style={styles.avatarRing}
            >
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatItem
            icon="📅"
            value={`${reservations.length}`}
            label="Reservas"
            progress={(reservations.length / 10) * 100}
          />
          <StatItem
            icon="❤️"
            value={`${favorites.length}`}
            label="Favoritos"
            progress={(favorites.length / 5) * 100}
          />
          <StatItem
            icon="⭐"
            value={`${totalPoints.toLocaleString()}`}
            label="Pts"
            progress={(totalPoints / 5000) * 100}
          />
        </View>

        {/* Achievements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Logros</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScroll}
        >
          {achievements.map((ach) => (
            <AchievementCard
              key={ach.id}
              icon={ach.icon}
              title={ach.title}
              progress={ach.progress}
              maxProgress={ach.maxProgress}
              unlocked={ach.unlocked}
            />
          ))}
        </ScrollView>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <GlassCard style={styles.menuCard}>
            <MenuItem
              icon="calendar"
              label="Mis Reservas"
              onPress={() => router.navigate('/(tabs)/activity')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="heart"
              label="Favoritos"
              onPress={() => router.push('/favorites')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="settings"
              label="Configuración"
              onPress={() => router.push('/settings')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="help-circle"
              label="Ayuda y Soporte"
              onPress={() => router.push('/help')}
            />
          </GlassCard>
        </View>

        {/* Dark Mode Toggle */}
        <GlassCard style={styles.darkModeCard}>
          <View style={styles.darkModeRow}>
            <View style={styles.darkModeLeft}>
              <Ionicons
                name={isDarkMode ? 'moon' : 'sunny'}
                size={22}
                color={isDarkMode ? '#FBBF24' : Colors.neonGreen}
              />
              <Text style={styles.darkModeLabel}>Modo Oscuro</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E2E8F0', true: Colors.neonGreen }}
              thumbColor="#fff"
            />
          </View>
        </GlassCard>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Pressable onPress={() => { logout(); router.replace('/auth'); }} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </Pressable>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>CanchaYa v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
  },
  avatarGlow: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E2E8F0',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 6,
  },
  progressBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  progressFillUnlocked: {
    backgroundColor: Colors.neonGreen,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  achievementsScroll: {
    gap: 10,
    paddingBottom: 20,
  },
  achievementCard: {
    width: 120,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  achievementUnlocked: {
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.25)',
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  achievementProgress: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  menuSection: {
    marginTop: 8,
  },
  menuCard: {
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 32,
  },
  darkModeCard: {
    marginTop: 16,
  },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  darkModeLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  logoutSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: 'transparent',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },
});
