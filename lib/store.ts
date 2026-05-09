import { create } from "zustand";
import { mockUser, getTodayDateString, mockNotifications, mockReservations, mockAchievements, type Notification, type Reservation, type Achievement } from "./mock-data";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface AppState {
  // Search
  searchQuery: string;
  
  // Selected items
  selectedComplexId: string | null;
  selectedCourtId: string | null;
  selectedDate: string;
  selectedTimeSlot: string | null;

  // Auth
  isAuthenticated: boolean;
  user: UserInfo | null;

  // Favorites & Notifications
  favorites: string[];
  notifications: Notification[];
  unreadNotificationCount: number;

  // Recently Viewed
  recentlyViewed: string[];

  // Onboarding
  hasCompletedOnboarding: boolean;

  // Chat
  isChatOpen: boolean;

  // Promo
  appliedPromoCode: string | null;
  promoDiscount: number;

  // Reservations
  reservations: Reservation[];

  // Theme
  isDarkMode: boolean;

  // Achievements
  achievements: Achievement[];

  // Actions
  setSearchQuery: (query: string) => void;
  selectComplex: (id: string) => void;
  selectCourt: (id: string) => void;
  selectDate: (date: string) => void;
  selectTimeSlot: (slot: string | null) => void;
  login: (user: UserInfo) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  addToRecentlyViewed: (id: string) => void;
  completeOnboarding: () => void;
  toggleChat: () => void;
  cancelReservation: (id: string) => void;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
  toggleDarkMode: () => void;
  unlockAchievement: (id: string) => void;
  clearSelections: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  searchQuery: "",
  selectedComplexId: null,
  selectedCourtId: null,
  selectedDate: getTodayDateString(),
  selectedTimeSlot: null,
  isAuthenticated: true,
  user: mockUser,
  favorites: [] as string[],
  notifications: mockNotifications,
  unreadNotificationCount: mockNotifications.filter(n => !n.read).length,
  recentlyViewed: [] as string[],
  hasCompletedOnboarding: false,
  isChatOpen: false,
  appliedPromoCode: null,
  promoDiscount: 0,
  reservations: mockReservations,
  isDarkMode: false,
  achievements: mockAchievements as Achievement[],

  setSearchQuery: (query) => set({ searchQuery: query }),

  selectComplex: (id) =>
    set((state) => {
      const updated = [id, ...state.recentlyViewed.filter((rvId) => rvId !== id)];
      return {
        selectedComplexId: id,
        selectedCourtId: null,
        selectedTimeSlot: null,
        recentlyViewed: updated.slice(0, 5),
      };
    }),

  selectCourt: (id) =>
    set({ selectedCourtId: id, selectedTimeSlot: null }),

  selectDate: (date) => set({ selectedDate: date, selectedTimeSlot: null }),

  selectTimeSlot: (slot) => set({ selectedTimeSlot: slot }),

  login: (user) =>
    set({
      isAuthenticated: true,
      user,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      selectedComplexId: null,
      selectedCourtId: null,
      selectedTimeSlot: null,
      searchQuery: "",
    }),

  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((fid) => fid !== id)
        : [...state.favorites, id],
    })),

  markNotificationRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadNotificationCount: notifications.filter((n) => !n.read).length,
      };
    }),

  markAllNotificationsRead: () =>
    set((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }));
      return { notifications, unreadNotificationCount: 0 };
    }),

  clearAllNotifications: () =>
    set({ notifications: [], unreadNotificationCount: 0 }),

  addToRecentlyViewed: (id) =>
    set((state) => {
      const updated = [id, ...state.recentlyViewed.filter((rvId) => rvId !== id)];
      return { recentlyViewed: updated.slice(0, 5) };
    }),

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  cancelReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      ),
    })),

  applyPromoCode: (code) => set({ appliedPromoCode: code }),

  removePromoCode: () => set({ appliedPromoCode: null, promoDiscount: 0 }),

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  unlockAchievement: (id) =>
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === id && !a.unlocked
          ? { ...a, unlocked: true, progress: a.maxProgress, unlockedDate: new Date().toISOString().split('T')[0] }
          : a
      ),
    })),

  clearSelections: () =>
    set({
      selectedComplexId: null,
      selectedCourtId: null,
      selectedTimeSlot: null,
      searchQuery: "",
    }),
}));
