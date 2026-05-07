// CanchaYa Theme Constants
// Green accent #84CC16 (lime-500) instead of neon #39FF14

export const Colors = {
  primary: '#84CC16',      // lime-500 - main accent
  primaryDark: '#65A30D',  // lime-600
  primaryLight: '#A3E635', // lime-400
  primaryBg: 'rgba(132, 204, 22, 0.15)',
  primaryBgStrong: 'rgba(132, 204, 22, 0.25)',
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundDark: '#0A0A0A',
  surface: '#F8F8F8',
  surfaceDark: '#141414',
  
  // Glass
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBgDark: 'rgba(20, 20, 20, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassBorderDark: 'rgba(255, 255, 255, 0.08)',
  glassNavBg: 'rgba(255, 255, 255, 0.85)',
  glassNavBgDark: 'rgba(10, 10, 10, 0.9)',
  
  // Text
  text: '#111111',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDark: '#F5F5F5',
  textSecondaryDark: '#AAAAAA',
  textTertiaryDark: '#666666',
  
  // Status
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Misc
  star: '#FBBF24',
  heart: '#EF4444',
  border: 'rgba(0,0,0,0.06)',
  borderDark: 'rgba(255,255,255,0.08)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  hero: 36,
};

export const Shadows = {
  card: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
  },
  nav: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 8,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
  },
  glow: {
    primary: {
      shadowColor: '#84CC16',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

// Lima, Peru coordinates for map default
export const DEFAULT_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Login background image
export const LOGIN_BG_IMAGE = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80';
