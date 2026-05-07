import { create } from 'zustand';
import { mockUser, getTodayDateString, mockNotifications, mockReservations, AppNotification, Reservation, UserInfo } from './mock-data';

export type TabType = 'home' | 'activity' | 'map' | 'profile';

interface AppState {
  // Navigation
  activeTab: TabType;
  
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
  notifications: AppNotification[];
  unreadNotificationCount: number;
  
  // Recently Viewed
  recentlyViewed: string[];
  
  // Theme
  isDarkMode: boolean;
  
  // Reservations
  reservations: Reservation[];
  
  // Actions
  setActiveTab: (tab: TabType) => void;
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
  toggleDarkMode: () => void;
  cancelReservation: (id: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  // Navigation initial state
  activeTab: 'home' as TabType,
  
  // Search initial state
  searchQuery: '',
  
  // Selected items initial state
  selectedComplexId: null as string | null,
  selectedCourtId: null as string | null,
  selectedDate: getTodayDateString(),
  selectedTimeSlot: null as string | null,
  
  // Auth initial state
  isAuthenticated: false,
  user: null,
  
  // Favorites & Notifications
  favorites: [] as string[],
  notifications: mockNotifications,
  unreadNotificationCount: mockNotifications.filter(n => !n.read).length,
  
  // Recently Viewed
  recentlyViewed: [] as string[],
  
  // Theme
  isDarkMode: false,
  
  // Reservations
  reservations: mockReservations,
  
  // Actions
  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      searchQuery: '',
    }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  selectComplex: (id) =>
    set((state) => {
      const updated = [id, ...state.recentlyViewed.filter((rvId) => rvId !== id)];
      const recentlyViewed = updated.slice(0, 5);
      return {
        selectedComplexId: id,
        selectedCourtId: null,
        selectedTimeSlot: null,
        recentlyViewed,
      };
    }),
  
  selectCourt: (id) =>
    set({
      selectedCourtId: id,
      selectedTimeSlot: null,
    }),
  
  selectDate: (date) => set({ selectedDate: date, selectedTimeSlot: null }),
  
  selectTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  
  login: (user) =>
    set({
      isAuthenticated: true,
      user,
      activeTab: 'home',
    }),
  
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      activeTab: 'home',
      selectedComplexId: null,
      selectedCourtId: null,
      selectedTimeSlot: null,
      searchQuery: '',
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
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  cancelReservation: (id) =>
    set((state) => {
      const reservations = state.reservations.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      );
      return { reservations };
    }),
}));
