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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { Colors, GlassShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';

interface ToggleItemProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function ToggleItem({ label, value, onValueChange }: ToggleItemProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E2E8F0', true: Colors.neonGreen }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const user = useAppStore((s) => s.user);
  const router = useRouter();

  // Notification toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Privacy toggles
  const [showProfile, setShowProfile] = useState(true);
  const [shareActivity, setShareActivity] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <GlassCard style={styles.sectionCard}>
          <View style={styles.accountRow}>
            <Ionicons name="person-outline" size={20} color={Colors.neonGreen} />
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Nombre</Text>
              <Text style={styles.accountValue}>{user?.name || '—'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.accountRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.neonGreen} />
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Correo electrónico</Text>
              <Text style={styles.accountValue}>{user?.email || '—'}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <GlassCard style={styles.sectionCard}>
          <ToggleItem
            label="Notificaciones push"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <View style={styles.divider} />
          <ToggleItem
            label="Notificaciones por email"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
          <View style={styles.divider} />
          <ToggleItem
            label="Notificaciones por SMS"
            value={smsNotifications}
            onValueChange={setSmsNotifications}
          />
        </GlassCard>

        {/* Privacy Section */}
        <Text style={styles.sectionTitle}>Privacidad</Text>
        <GlassCard style={styles.sectionCard}>
          <ToggleItem
            label="Mostrar perfil"
            value={showProfile}
            onValueChange={setShowProfile}
          />
          <View style={styles.divider} />
          <ToggleItem
            label="Compartir actividad"
            value={shareActivity}
            onValueChange={setShareActivity}
          />
        </GlassCard>

        {/* Language Section */}
        <Text style={styles.sectionTitle}>Idioma</Text>
        <GlassCard style={styles.sectionCard}>
          <View style={styles.languageRow}>
            <View style={styles.languageLeft}>
              <Ionicons name="globe-outline" size={20} color={Colors.neonGreen} />
              <Text style={styles.toggleLabel}>Idioma de la app</Text>
            </View>
            <Text style={styles.languageValue}>Español</Text>
          </View>
        </GlassCard>

        {/* Delete Account */}
        <View style={styles.deleteSection}>
          {!showDeleteConfirm ? (
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteText}>Eliminar cuenta</Text>
            </Pressable>
          ) : (
            <GlassCard style={styles.deleteConfirmCard}>
              <Text style={styles.deleteConfirmTitle}>¿Estás seguro?</Text>
              <Text style={styles.deleteConfirmSubtitle}>
                Esta acción no se puede deshacer. Se eliminarán todos tus datos.
              </Text>
              <View style={styles.deleteConfirmButtons}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  style={styles.deleteCancelBtn}
                >
                  <Text style={styles.deleteCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.deleteConfirmBtn}>
                  <Ionicons name="warning" size={16} color="#fff" />
                  <Text style={styles.deleteConfirmBtnText}>Eliminar</Text>
                </Pressable>
              </View>
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionCard: {
    paddingVertical: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  accountValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 32,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageValue: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  deleteSection: {
    marginTop: 32,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: 'transparent',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  deleteConfirmCard: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  deleteConfirmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 6,
  },
  deleteConfirmSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  deleteCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  deleteConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
  },
  deleteConfirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
