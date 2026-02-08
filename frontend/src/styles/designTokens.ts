export const colors = {
  primary: 'var(--primary-color, #6200EE)',
  primaryDark: '#3700B3',
  primaryLight: '#BB86FC',
  secondary: 'var(--secondary-color, #03DAC6)',
  secondaryDark: '#018786',
  secondaryLight: '#66FFF9',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onSurface: 'rgba(0, 0, 0, 0.87)', // High emphasis
  onSurfaceMedium: 'rgba(0, 0, 0, 0.60)', // Medium emphasis
  onSurfaceLow: 'rgba(0, 0, 0, 0.38)', // Disabled / Hint
  onBackground: '#000000',
  onWarning: '#000000',
  onSurfaceVariant: 'rgba(0, 0, 0, 0.60)',
};

export const typography = {
  fontFamilyPrimary: 'var(--font-family, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
  fontFamilySecondary: 'Inter, sans-serif',
  // Scale adjusted for "Airy" feel: -0.02em tracking for headings, relaxed line-heights
  displayLarge: { fontSize: '57px', lineHeight: '1.2', fontWeight: 400, letterSpacing: '-0.02em' },
  displayMedium: { fontSize: '45px', lineHeight: '1.2', fontWeight: 400, letterSpacing: '-0.02em' },
  displaySmall: { fontSize: '36px', lineHeight: '1.2', fontWeight: 400, letterSpacing: '-0.02em' },
  headlineLarge: { fontSize: '32px', lineHeight: '1.3', fontWeight: 400, letterSpacing: '-0.02em' },
  headlineMedium: { fontSize: '28px', lineHeight: '1.3', fontWeight: 400, letterSpacing: '-0.015em' },
  headlineSmall: { fontSize: '24px', lineHeight: '1.3', fontWeight: 400, letterSpacing: '-0.015em' },
  titleLarge: { fontSize: '22px', lineHeight: '1.4', fontWeight: 400, letterSpacing: '0' },
  titleMedium: { fontSize: '16px', lineHeight: '1.5', fontWeight: 500, letterSpacing: '0.01em' },
  titleSmall: { fontSize: '14px', lineHeight: '1.5', fontWeight: 500, letterSpacing: '0.01em' },
  bodyLarge: { fontSize: '16px', lineHeight: '1.6', fontWeight: 400, letterSpacing: '0.01em' }, // Relaxed reading
  bodyMedium: { fontSize: '14px', lineHeight: '1.6', fontWeight: 400, letterSpacing: '0.01em' },
  bodySmall: { fontSize: '12px', lineHeight: '1.6', fontWeight: 400, letterSpacing: '0.02em' },
  labelLarge: { fontSize: '14px', lineHeight: '1.4', fontWeight: 500, letterSpacing: '0.02em' },
  labelMedium: { fontSize: '12px', lineHeight: '1.4', fontWeight: 500, letterSpacing: '0.02em' },
  labelSmall: { fontSize: '11px', lineHeight: '1.4', fontWeight: 500, letterSpacing: '0.02em' },
};

export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  xxl: '64px',
  xxxl: '80px',
  xxxxl: '96px',
};

export const shadows = {
  elevation1:
    '0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)', // Softer shadows
  elevation2:
    '0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
  premium: 
    '0 20px 40px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)', // Deep glass shadow
};

export const borderRadius = {
  small: '6px',
  medium: '12px', // More modern rounding
  large: '20px',
  round: '50%',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #6200EE 0%, #3700B3 100%)',
  secondary: 'linear-gradient(135deg, #03DAC6 0%, #018786 100%)',
  success: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
  error: 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
  warning: 'linear-gradient(135deg, #FFC107 0%, #FFA000 100%)',
  info: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
  surface: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)', // Glassy surface
};
