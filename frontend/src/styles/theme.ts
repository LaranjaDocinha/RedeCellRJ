
// frontend/src/styles/theme.ts
import { DefaultTheme } from 'styled-components';

const breakpoints = {
  mobileS: '320px',
  mobileM: '375px',
  mobileL: '425px',
  tablet: '768px',
  laptop: '1024px',
  laptopL: '1440px',
  desktop: '2560px',
};

export const lightTheme: DefaultTheme = {
  colors: {
    primary: '#6200EE',
    primaryDark: '#3700B3',
    primaryLight: '#BB86FC',
    secondary: '#03DAC6',
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
    onSurface: '#000000',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  spacing: {
    xxs: '4px',
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    xxl: '64px',
    xxxl: '80px',
    xxxxl: '96px',
  },
  shadows: {
    elevation1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    elevation2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  },
  typography: {
    primaryFont: 'Roboto, sans-serif',
    secondaryFont: 'Open Sans, sans-serif',
  },
  breakpoints,
};

export const darkTheme: DefaultTheme = {
  colors: {
    primary: '#BB86FC',
    primaryDark: '#3700B3',
    primaryLight: '#BB86FC',
    secondary: '#03DAC6',
    secondaryDark: '#018786',
    secondaryLight: '#66FFF9',
    error: '#CF6679',
    success: '#66BB6A',
    warning: '#FFD54F',
    info: '#4FC3F7',
    surface: '#121212',
    background: '#121212',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
  },
  borderRadius: { ...lightTheme.borderRadius },
  spacing: { ...lightTheme.spacing },
  typography: { ...lightTheme.typography },
  breakpoints,
};
