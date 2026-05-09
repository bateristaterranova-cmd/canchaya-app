// CanchaYa Theme Constants - Premium Light Glassmorphism
export const Colors = {
  neonGreen: '#39FF14',
  neonGreenLight: '#5FFF3F',
  neonGreenDark: '#2BCC10',
  
  // Light mode
  light: {
    background: '#F8FAFC',
    card: 'rgba(255, 255, 255, 0.75)',
    cardBorder: 'rgba(255, 255, 255, 0.5)',
    cardHover: 'rgba(255, 255, 255, 0.9)',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    input: 'rgba(255, 255, 255, 0.6)',
    inputBorder: 'rgba(255, 255, 255, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.3)',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Dark mode
  dark: {
    background: '#0F172A',
    card: 'rgba(30, 41, 59, 0.7)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardHover: 'rgba(30, 41, 59, 0.85)',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    input: 'rgba(30, 41, 59, 0.6)',
    inputBorder: 'rgba(255, 255, 255, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
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

export const NeonShadows = {
  sm: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  md: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  lg: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 6,
  },
};

export const GlassShadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 5,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 5,
  },
};
