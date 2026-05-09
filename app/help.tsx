import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, GlassShadows } from '@/lib/theme';
import GlassCard from '@/components/ui/GlassCard';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿Cómo hago una reserva?',
    answer: 'Busca un complejo deportivo en la pantalla principal, selecciona la cancha que prefieras, elige la fecha y hora disponible, y procede al pago. ¡Es muy rápido y sencillo!',
  },
  {
    id: 'faq-2',
    question: '¿Puedo cancelar una reserva?',
    answer: 'Sí, puedes cancelar reservas con estado "Pendiente" o "Confirmada" desde la sección de Actividad. Las cancelaciones deben hacerse al menos 2 horas antes del horario reservado.',
  },
  {
    id: 'faq-3',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos Yape, Plin, tarjetas de crédito/débito y transferencia bancaria. Todos los pagos son seguros y encriptados.',
  },
  {
    id: 'faq-4',
    question: '¿Cómo obtengo mis puntos de fidelidad?',
    answer: 'Por cada reserva completada ganas 250 puntos. Los puntos se pueden canjear por descuentos en futuras reservas. Consulta tus puntos en tu perfil.',
  },
  {
    id: 'faq-5',
    question: '¿Qué pasa si llueve y tengo una reserva al aire libre?',
    answer: 'Si el complejo no tiene cancha techada y las condiciones climáticas impiden el juego, puedes reprogramar tu reserva sin costo adicional. Contacta al complejo directamente.',
  },
];

interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  const chevronRotation = useSharedValue(0);

  React.useEffect(() => {
    chevronRotation.value = withTiming(isOpen ? 180 : 0, { duration: 250 });
  }, [isOpen]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  return (
    <Pressable onPress={onToggle}>
      <GlassCard style={[styles.faqCard, isOpen && styles.faqCardOpen]}>
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={18} color={isOpen ? Colors.neonGreen : '#94A3B8'} />
          </Animated.View>
        </View>
        {isOpen && (
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        )}
      </GlassCard>
    </Pressable>
  );
}

interface ContactButtonProps {
  icon: string;
  label: string;
  subtitle: string;
  color: string;
}

function ContactButton({ icon, label, subtitle, color }: ContactButtonProps) {
  return (
    <GlassCard style={styles.contactCard}>
      <Pressable style={styles.contactRow}>
        <View style={[styles.contactIconCircle, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>{label}</Text>
          <Text style={styles.contactSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </Pressable>
    </GlassCard>
  );
}

export default function HelpScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const router = useRouter();

  const filteredFaq = searchQuery
    ? FAQ_DATA.filter(
        (f) =>
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQ_DATA;

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar en preguntas frecuentes..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
        <View style={styles.faqList}>
          {filteredFaq.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openFaqId === item.id}
              onToggle={() => toggleFaq(item.id)}
            />
          ))}
          {filteredFaq.length === 0 && (
            <View style={styles.emptyFaq}>
              <Ionicons name="search-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyFaqText}>
                No se encontraron resultados para "{searchQuery}"
              </Text>
            </View>
          )}
        </View>

        {/* Contact Section */}
        <Text style={styles.sectionTitle}>Contáctanos</Text>
        <View style={styles.contactList}>
          <ContactButton
            icon="logo-whatsapp"
            label="WhatsApp"
            subtitle="+51 999 888 777"
            color="#25D366"
          />
          <ContactButton
            icon="mail"
            label="Email"
            subtitle="soporte@canchaya.pe"
            color="#3B82F6"
          />
          <ContactButton
            icon="call"
            label="Teléfono"
            subtitle="+51 1 445 7890"
            color={Colors.neonGreen}
          />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...GlassShadows.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 12,
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    paddingVertical: 14,
  },
  faqCardOpen: {
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.2)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emptyFaq: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyFaqText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  contactList: {
    gap: 10,
  },
  contactCard: {
    paddingVertical: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 32,
  },
});
