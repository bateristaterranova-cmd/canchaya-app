// ===========================
// Types
// ===========================

export interface Complex {
  id: string;
  name: string;
  description: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  image: string;
  rating: number;
  minPrice: number;
  maxPrice: number;
  phone: string;
  openHour: number;
  closeHour: number;
  amenities: string[];
  courts: Court[];
}

export interface Court {
  id: string;
  name: string;
  complexId: string;
  type: string;
  surface: string;
  pricePerHour: number;
  image: string;
  capacity: number;
}

export interface Reservation {
  id: string;
  userId: string;
  courtId: string;
  complexId: string;
  complexName: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "in_process" | "confirmed" | "cancelled" | "completed";
  totalPrice: number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  complexId: string;
  rating: number;
  comment: string;
  date: string;
  courtType?: string;
}

export interface AppNotification {
  id: string;
  type: 'booking_confirmed' | 'booking_reminder' | 'booking_cancelled' | 'promotion' | 'review_request';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  complexId?: string;
  reservationId?: string;
}

// ===========================
// Mock Complexes
// ===========================

export const mockComplexes: Complex[] = [
  {
    id: "complex-1",
    name: "Complejo Deportivo El Campeón",
    description: "El mejor complejo deportivo de Miraflores con canchas de última generación y iluminación LED profesional.",
    district: "Miraflores",
    address: "Av. Larco 1240, Miraflores",
    lat: -12.1196,
    lng: -77.0365,
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800",
    rating: 4.8,
    minPrice: 120,
    maxPrice: 200,
    phone: "+51 1 445 7890",
    openHour: 7,
    closeHour: 23,
    amenities: ["Estacionamiento", "Vestuarios", "Duchas", "Cafetería", "WiFi", "Iluminación LED"],
    courts: [
      { id: "court-1-1", name: "Cancha A - Fútbol 5", complexId: "complex-1", type: "futbol5", surface: "Grass Sintético", pricePerHour: 120, image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800", capacity: 10 },
      { id: "court-1-2", name: "Cancha B - Fútbol 5", complexId: "complex-1", type: "futbol5", surface: "Grass Sintético", pricePerHour: 120, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800", capacity: 10 },
      { id: "court-1-3", name: "Cancha C - Fútbol 7", complexId: "complex-1", type: "futbol7", surface: "Grass Sintético Premium", pricePerHour: 200, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800", capacity: 14 },
    ],
  },
  {
    id: "complex-2",
    name: "Canchas Gol Perú",
    description: "Complejo deportivo con canchas techadas y al aire libre. Ideal para partidos nocturnos.",
    district: "San Isidro",
    address: "Calle Los Sauces 345, San Isidro",
    lat: -12.0975,
    lng: -77.0372,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    rating: 4.5,
    minPrice: 100,
    maxPrice: 180,
    phone: "+51 1 421 3456",
    openHour: 8,
    closeHour: 23,
    amenities: ["Estacionamiento", "Vestuarios", "Duchas", "Iluminación LED", "Cancha techada"],
    courts: [
      { id: "court-2-1", name: "Cancha 1 - Fútbol 5 Techada", complexId: "complex-2", type: "futbol5", surface: "Grass Sintético", pricePerHour: 140, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", capacity: 10 },
      { id: "court-2-2", name: "Cancha 2 - Fútbol 5", complexId: "complex-2", type: "futbol5", surface: "Grass Sintético", pricePerHour: 100, image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800", capacity: 10 },
      { id: "court-2-3", name: "Cancha 3 - Fútbol 7", complexId: "complex-2", type: "futbol7", surface: "Grass Sintético", pricePerHour: 180, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800", capacity: 14 },
      { id: "court-2-4", name: "Cancha 4 - Pádel", complexId: "complex-2", type: "padel", surface: "Cristal y Muro", pricePerHour: 90, image: "https://images.unsplash.com/photo-1627637577517-5a8c8393c1d2?w=800", capacity: 4 },
    ],
  },
  {
    id: "complex-3",
    name: "Sport Center Lima",
    description: "Centro deportivo integral en Surco con canchas de fútbol y pádel.",
    district: "Surco",
    address: "Av. El Polo 780, Santiago de Surco",
    lat: -12.0873,
    lng: -76.9781,
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
    rating: 4.3,
    minPrice: 80,
    maxPrice: 160,
    phone: "+51 1 345 6789",
    openHour: 8,
    closeHour: 22,
    amenities: ["Estacionamiento", "Vestuarios", "Cafetería", "WiFi", "Iluminación LED"],
    courts: [
      { id: "court-3-1", name: "Cancha Norte - Fútbol 5", complexId: "complex-3", type: "futbol5", surface: "Grass Sintético", pricePerHour: 80, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", capacity: 10 },
      { id: "court-3-2", name: "Cancha Sur - Fútbol 5", complexId: "complex-3", type: "futbol5", surface: "Grass Sintético", pricePerHour: 80, image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800", capacity: 10 },
      { id: "court-3-3", name: "Cancha Central - Fútbol 7", complexId: "complex-3", type: "futbol7", surface: "Grass Sintético Premium", pricePerHour: 160, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800", capacity: 14 },
    ],
  },
  {
    id: "complex-4",
    name: "La Molina Sports Park",
    description: "Amplio complejo deportivo en La Molina con canchas de fútbol 11 y áreas verdes.",
    district: "La Molina",
    address: "Av. La Molina 520, La Molina",
    lat: -12.0703,
    lng: -76.9534,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    rating: 4.6,
    minPrice: 150,
    maxPrice: 250,
    phone: "+51 1 478 2345",
    openHour: 7,
    closeHour: 23,
    amenities: ["Estacionamiento", "Vestuarios", "Duchas", "Cafetería", "WiFi", "Iluminación LED", "Cancha techada"],
    courts: [
      { id: "court-4-1", name: "Estadio - Fútbol 11", complexId: "complex-4", type: "futbol11", surface: "Grass Natural", pricePerHour: 250, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800", capacity: 22 },
      { id: "court-4-2", name: "Cancha Águila - Fútbol 7", complexId: "complex-4", type: "futbol7", surface: "Grass Sintético", pricePerHour: 180, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", capacity: 14 },
      { id: "court-4-3", name: "Cancha Cóndor - Fútbol 5", complexId: "complex-4", type: "futbol5", surface: "Grass Sintético", pricePerHour: 150, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800", capacity: 10 },
    ],
  },
  {
    id: "complex-5",
    name: "San Borja Fútbol Club",
    description: "Complejo exclusivo en San Borja con canchas de última generación y vestuarios premium.",
    district: "San Borja",
    address: "Av. Aviación 2450, San Borja",
    lat: -12.1083,
    lng: -77.0064,
    image: "https://images.unsplash.com/photo-1627637577517-5a8c8393c1d2?w=800",
    rating: 4.7,
    minPrice: 110,
    maxPrice: 220,
    phone: "+51 1 512 3456",
    openHour: 8,
    closeHour: 23,
    amenities: ["Estacionamiento", "Vestuarios", "Duchas", "Cafetería", "WiFi", "Iluminación LED", "Cancha techada"],
    courts: [
      { id: "court-5-1", name: "Cancha Diamante - Fútbol 5 Techada", complexId: "complex-5", type: "futbol5", surface: "Grass Sintético Premium", pricePerHour: 130, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", capacity: 10 },
      { id: "court-5-2", name: "Cancha Oro - Fútbol 7", complexId: "complex-5", type: "futbol7", surface: "Grass Sintético Premium", pricePerHour: 220, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800", capacity: 14 },
      { id: "court-5-3", name: "Cancha Pádel 1", complexId: "complex-5", type: "padel", surface: "Cristal y Muro", pricePerHour: 110, image: "https://images.unsplash.com/photo-1627637577517-5a8c8393c1d2?w=800", capacity: 4 },
    ],
  },
  {
    id: "complex-6",
    name: "Barranco Deportivo",
    description: "Complejo deportivo en el corazón de Barranco con ambiente bohemio y canchas de calidad.",
    district: "Barranco",
    address: "Av. Grau 890, Barranco",
    lat: -12.1475,
    lng: -77.0216,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    rating: 4.1,
    minPrice: 90,
    maxPrice: 150,
    phone: "+51 1 256 7890",
    openHour: 9,
    closeHour: 22,
    amenities: ["Vestuarios", "Duchas", "Cafetería", "Iluminación LED"],
    courts: [
      { id: "court-6-1", name: "Cancha Puente - Fútbol 5", complexId: "complex-6", type: "futbol5", surface: "Grass Sintético", pricePerHour: 90, image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800", capacity: 10 },
      { id: "court-6-2", name: "Cancha Malecón - Fútbol 5", complexId: "complex-6", type: "futbol5", surface: "Grass Sintético", pricePerHour: 100, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", capacity: 10 },
      { id: "court-6-3", name: "Cancha Bajada - Pádel", complexId: "complex-6", type: "padel", surface: "Cristal y Muro", pricePerHour: 150, image: "https://images.unsplash.com/photo-1627637577517-5a8c8393c1d2?w=800", capacity: 4 },
    ],
  },
  {
    id: "complex-7",
    name: "Pueblo Libre Sports Arena",
    description: "Arena deportiva moderna en Pueblo Libre con instalaciones de primer nivel.",
    district: "Pueblo Libre",
    address: "Av. Sucre 1150, Pueblo Libre",
    lat: -12.0756,
    lng: -77.0534,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    rating: 4.4,
    minPrice: 95,
    maxPrice: 170,
    phone: "+51 1 460 1234",
    openHour: 8,
    closeHour: 23,
    amenities: ["Estacionamiento", "Vestuarios", "Duchas", "Cafetería", "WiFi", "Cancha techada"],
    courts: [
      { id: "court-7-1", name: "Cancha Libertad - Fútbol 5 Techada", complexId: "complex-7", type: "futbol5", surface: "Grass Sintético", pricePerHour: 110, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", capacity: 10 },
      { id: "court-7-2", name: "Cancha Alianza - Fútbol 7", complexId: "complex-7", type: "futbol7", surface: "Grass Sintético", pricePerHour: 170, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800", capacity: 14 },
      { id: "court-7-3", name: "Cancha Pádel Norte", complexId: "complex-7", type: "padel", surface: "Cristal y Muro", pricePerHour: 95, image: "https://images.unsplash.com/photo-1627637577517-5a8c8393c1d2?w=800", capacity: 4 },
      { id: "court-7-4", name: "Cancha Pádel Sur", complexId: "complex-7", type: "padel", surface: "Cristal y Muro", pricePerHour: 95, image: "https://images.unsplash.com/photo-1627637577517-5a8c8393c1d2?w=800", capacity: 4 },
    ],
  },
  {
    id: "complex-8",
    name: "Jesús María Green Field",
    description: "Canchas de grass sintético de alta calidad en Jesús María. Precios accesibles.",
    district: "Jesús María",
    address: "Av. Salaverry 2100, Jesús María",
    lat: -12.0792,
    lng: -77.0425,
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
    rating: 3.9,
    minPrice: 70,
    maxPrice: 140,
    phone: "+51 1 334 5678",
    openHour: 8,
    closeHour: 22,
    amenities: ["Vestuarios", "Duchas", "Iluminación LED"],
    courts: [
      { id: "court-8-1", name: "Cancha Verde 1 - Fútbol 5", complexId: "complex-8", type: "futbol5", surface: "Grass Sintético", pricePerHour: 70, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800", capacity: 10 },
      { id: "court-8-2", name: "Cancha Verde 2 - Fútbol 5", complexId: "complex-8", type: "futbol5", surface: "Grass Sintético", pricePerHour: 70, image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800", capacity: 10 },
      { id: "court-8-3", name: "Cancha Esperanza - Fútbol 7", complexId: "complex-8", type: "futbol7", surface: "Grass Sintético", pricePerHour: 140, image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800", capacity: 14 },
    ],
  },
];

export const mockUser: UserInfo = {
  id: "user-1",
  name: "Carlos Mendoza Ríos",
  email: "carlos.mendoza@email.com",
  phone: "+51 999 888 777",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
};

export const mockReservations: Reservation[] = [
  { id: "res-1", userId: "user-1", courtId: "court-1-1", complexId: "complex-1", complexName: "Complejo Deportivo El Campeón", courtName: "Cancha A - Fútbol 5", date: "2026-05-06", startTime: "19:00", endTime: "20:00", status: "confirmed", totalPrice: 120 },
  { id: "res-2", userId: "user-1", courtId: "court-5-3", complexId: "complex-5", complexName: "San Borja Fútbol Club", courtName: "Cancha Pádel 1", date: "2026-05-07", startTime: "18:00", endTime: "19:00", status: "pending", totalPrice: 110 },
  { id: "res-3", userId: "user-1", courtId: "court-3-1", complexId: "complex-3", complexName: "Sport Center Lima", courtName: "Cancha Norte - Fútbol 5", date: "2026-05-04", startTime: "20:00", endTime: "21:00", status: "completed", totalPrice: 80 },
  { id: "res-4", userId: "user-1", courtId: "court-4-2", complexId: "complex-4", complexName: "La Molina Sports Park", courtName: "Cancha Águila - Fútbol 7", date: "2026-05-03", startTime: "16:00", endTime: "17:00", status: "cancelled", totalPrice: 180 },
];

export const mockTimeSlots: TimeSlot[] = [
  { time: "08:00", available: true, price: 80 },
  { time: "09:00", available: true, price: 80 },
  { time: "10:00", available: false, price: 80 },
  { time: "11:00", available: true, price: 90 },
  { time: "12:00", available: false, price: 90 },
  { time: "13:00", available: true, price: 90 },
  { time: "14:00", available: true, price: 100 },
  { time: "15:00", available: true, price: 100 },
  { time: "16:00", available: false, price: 110 },
  { time: "17:00", available: false, price: 110 },
  { time: "18:00", available: true, price: 120 },
  { time: "19:00", available: false, price: 130 },
  { time: "20:00", available: true, price: 130 },
  { time: "21:00", available: true, price: 120 },
  { time: "22:00", available: true, price: 100 },
];

export const mockNotifications: AppNotification[] = [
  { id: "notif-1", type: "booking_reminder", title: "Recordatorio de reserva", message: "Tu reserva en Complejo Deportivo El Campeón es mañana a las 19:00", timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, complexId: "complex-1" },
  { id: "notif-2", type: "booking_confirmed", title: "Reserva confirmada", message: "Tu pago de S/142 ha sido procesado exitosamente", timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, reservationId: "res-1" },
  { id: "notif-3", type: "promotion", title: "¡Oferta especial!", message: "20% de descuento en canchas techadas este fin de semana", timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
  { id: "notif-4", type: "review_request", title: "¿Cómo fue tu partido?", message: "Deja tu opinión sobre Sport Center Lima", timestamp: new Date(Date.now() - 172800000).toISOString(), read: true, complexId: "complex-3" },
  { id: "notif-5", type: "booking_reminder", title: "Reserva en 2 horas", message: "No olvides: San Borja FC a las 18:00", timestamp: new Date(Date.now() - 259200000).toISOString(), read: true, complexId: "complex-5" },
];

export const mockReviews: Review[] = [
  { id: "rev-1", userId: "user-1", userName: "Carlos Mendoza", userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", complexId: "complex-1", rating: 5, comment: "Excelente cancha, grass en perfectas condiciones. Los vestuarios muy limpios.", date: "2026-04-28", courtType: "futbol5" },
  { id: "rev-2", userId: "user-2", userName: "María García", userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", complexId: "complex-1", rating: 4, comment: "Muy buen complejo, pero el estacionamiento es pequeño.", date: "2026-04-25", courtType: "futbol7" },
  { id: "rev-3", userId: "user-3", userName: "Diego Torres", userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", complexId: "complex-1", rating: 5, comment: "La mejor cancha de Miraflores sin duda.", date: "2026-04-20", courtType: "futbol5" },
  { id: "rev-4", userId: "user-4", userName: "Ana López", userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", complexId: "complex-2", rating: 5, comment: "Las canchas techadas son increíbles!", date: "2026-04-22", courtType: "futbol5" },
  { id: "rev-5", userId: "user-2", userName: "María García", userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", complexId: "complex-5", rating: 5, comment: "Canchas techadas premium. Vestuarios de primer nivel.", date: "2026-04-05", courtType: "futbol5" },
  { id: "rev-6", userId: "user-3", userName: "Diego Torres", userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", complexId: "complex-4", rating: 5, comment: "La cancha de fútbol 11 es espectacular.", date: "2026-04-12", courtType: "futbol11" },
  { id: "rev-7", userId: "user-1", userName: "Carlos Mendoza", userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", complexId: "complex-3", rating: 3, comment: "Buenas canchas pero vestuarios necesitan mejora.", date: "2026-04-10", courtType: "futbol5" },
  { id: "rev-8", userId: "user-4", userName: "Ana López", userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", complexId: "complex-7", rating: 4, comment: "Arena moderna y canchas techadas. Café gourmet delicioso.", date: "2026-03-25", courtType: "futbol5" },
];

// ===========================
// Helper functions
// ===========================

export function getComplexById(id: string): Complex | undefined {
  return mockComplexes.find((c) => c.id === id);
}

export function getCourtTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    futbol5: "Fútbol 5",
    futbol7: "Fútbol 7",
    futbol11: "Fútbol 11",
    padel: "Pádel",
  };
  return labels[type] || type;
}

export function getReservationStatusLabel(status: Reservation["status"]): string {
  const labels: Record<Reservation["status"], string> = {
    pending: "Pendiente",
    in_process: "En proceso",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
  };
  return labels[status];
}

export function formatPrice(price: number): string {
  return `S/${price}`;
}

export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export function formatNotificationTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
  if (diff < 172800000) return 'Ayer';
  return `Hace ${Math.floor(diff / 86400000)} días`;
}

export function getReviewsByComplexId(complexId: string): Review[] {
  return mockReviews.filter(r => r.complexId === complexId);
}

export function getAverageRating(complexId: string): number {
  const reviews = getReviewsByComplexId(complexId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export const districts = [
  'Todos', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja', 'Barranco', 'Pueblo Libre', 'Jesús María',
];

export const sportTypes = [
  { id: 'todos', label: 'Todos' },
  { id: 'futbol5', label: 'Fútbol 5' },
  { id: 'futbol7', label: 'Fútbol 7' },
  { id: 'futbol11', label: 'Fútbol 11' },
  { id: 'padel', label: 'Pádel' },
];

export const promotionalBanners = [
  { id: 1, title: '¡20% OFF en tu primera reserva!', emoji: '⚽', buttonText: 'Reservar ahora', gradient: ['#84CC16', '#65A30D'] },
  { id: 2, title: 'Canchas techadas disponibles', emoji: '🌧️', buttonText: 'Ver canchas', gradient: ['#3B82F6', '#1D4ED8'] },
  { id: 3, title: 'Invita amigos y gana S/50', emoji: '🎁', buttonText: 'Compartir', gradient: ['#A855F7', '#7C3AED'] },
];
