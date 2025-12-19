import { createTheme, ThemeOptions, Theme as MuiTheme } from '@mui/material/styles';
import { colors, typography, spacing, shadows, borderRadius } from './designTokens';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Extend the Theme interface to include custom properties
declare module '@mui/material/styles' {
  interface Theme {
    name: string;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
    colors: typeof colors; // Add custom colors to MUI theme
    spacing: (factor: number) => string; // Override spacing type
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    name?: string;
    borderRadius?: typeof borderRadius;
    shadows?: typeof shadows;
    colors?: typeof colors; // Add custom colors to MUI theme
    spacing?: (factor: number) => string; // Override spacing type
  }
}

// Extend styled-components default theme to include MUI theme properties
declare module 'styled-components' {
  export interface DefaultTheme extends MuiTheme {
    colors: typeof colors;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
    typography: MuiTheme['typography']; // Explicitly add typography
  }
}

const muiSpacing = (factor: number) => `${factor * 8}px`; // MUI default spacing is 8px increment

const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: typography.fontFamilyPrimary,
    h1: { ...typography.displayLarge },
    h2: { ...typography.displayMedium },
    h3: { ...typography.displaySmall },
    h4: { ...typography.headlineLarge },
    h5: { ...typography.headlineMedium },
    h6: { ...typography.headlineSmall },
    subtitle1: { ...typography.titleLarge },
    subtitle2: { ...typography.titleMedium },
    body1: { ...typography.bodyLarge },
    body2: { ...typography.bodyMedium },
    button: { ...typography.labelLarge },
    caption: { ...typography.bodySmall },
    overline: { ...typography.labelSmall },
  },
  spacing: (factor: number) => {
    const spacingMap: { [key: number]: string } = {
      0: '0px',
      1: spacing.xxs, // 4px
      2: spacing.xs,  // 8px
      3: spacing.sm,  // 16px
      4: spacing.md,  // 24px
      5: spacing.lg,  // 32px
      6: spacing.xl,  // 48px
      7: spacing.xxl, // 64px
      8: spacing.xxxl, // 80px
      9: spacing.xxxxl, // 96px
    };
    return spacingMap[factor] || muiSpacing(factor);
  },
  breakpoints: {
    values: {
      xs: 320,
      sm: 768,
      md: 1024,
      lg: 1440,
      xl: 2560,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Disable shadow by default for buttons
      },
      styleOverrides: {
        root: {
          borderRadius: borderRadius.small, // Apply custom border radius
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.medium, // Apply custom border radius
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.medium, // Apply custom border radius
        },
      },
    },
  },
  borderRadius, // Custom property
  shadows, // Custom property
  colors, // Custom property
};

export const lightTheme = createTheme({
  ...commonThemeOptions,
  name: 'light',
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
      contrastText: colors.onPrimary,
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
      contrastText: colors.onSecondary,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
    success: {
      main: colors.success,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.onSurface,
      secondary: colors.onSurfaceVariant,
    },
  },
});

export const darkTheme = createTheme({
  ...commonThemeOptions,
  name: 'dark',
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary, // Using light theme primary for consistency in dark mode
      light: colors.primaryLight,
      dark: colors.primaryDark,
      contrastText: colors.onPrimary,
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
      contrastText: colors.onSecondary,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
    success: {
      main: colors.success,
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E', // Darker surface
    },
    text: {
      primary: '#FFFFFF', // White text on dark background
      secondary: '#B0B0B0', // Lighter grey for secondary text
    },
  },
});

export const highContrastTheme = createTheme({
  ...commonThemeOptions,
  name: 'high-contrast',
  palette: {
    mode: 'dark', // High contrast is typically dark mode based
    primary: {
      main: '#FFFF00', // Bright yellow for primary actions
      contrastText: '#000000',
    },
    secondary: {
      main: '#00FFFF', // Cyan for secondary actions
      contrastText: '#000000',
    },
    error: {
      main: '#FF00FF', // Magenta for errors
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFA500', // Orange for warnings
      contrastText: '#000000',
    },
    info: {
      main: '#00BFFF', // Deep Sky Blue for info
      contrastText: '#000000',
    },
    success: {
      main: '#00FF00', // Bright green for success
      contrastText: '#000000',
    },
    background: {
      default: '#000000', // Pure black background
      paper: '#000000', // Pure black surface
    },
    text: {
      primary: '#FFFFFF', // Pure white text
      secondary: '#E0E0E0', // Off-white for secondary text
    },
  },
  // Override specific component styles for high contrast
  components: {
    ...commonThemeOptions.components,
    MuiButton: {
      ...commonThemeOptions.components?.MuiButton,
      styleOverrides: {
        root: {
          ...commonThemeOptions.components?.MuiButton?.styleOverrides?.root,
          border: '2px solid', // Add strong border
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#FFFF00',
            color: '#000000',
            borderColor: '#FFFF00',
            '&:hover': {
              backgroundColor: '#CCCC00',
              borderColor: '#CCCC00',
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: '#00FFFF',
            color: '#000000',
            borderColor: '#00FFFF',
            '&:hover': {
              backgroundColor: '#00CCCC',
              borderColor: '#00CCCC',
            },
          },
          '&.MuiButton-outlinedPrimary': {
            color: '#FFFF00',
            borderColor: '#FFFF00',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 0, 0.1)',
            },
          },
          '&.MuiButton-outlinedSecondary': {
            color: '#00FFFF',
            borderColor: '#00FFFF',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
            },
          },
        },
      },
    },
    MuiPaper: {
      ...commonThemeOptions.components?.MuiPaper,
      styleOverrides: {
        root: {
          ...commonThemeOptions.components?.MuiPaper?.styleOverrides?.root,
          border: '1px solid #FFFFFF', // White border for contrast
        },
      },
    },
    MuiInputBase: { // For text fields
      styleOverrides: {
        root: {
          backgroundColor: '#333333', // Dark background for input fields
          color: '#FFFFFF', // White text
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFFFF', // White border
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFF00', // Yellow border on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFFF00', // Yellow border on focus
          },
        },
      },
    },
    MuiInputLabel: { // For input labels
      styleOverrides: {
        root: {
          color: '#FFFFFF', // White label text
          '&.Mui-focused': {
            color: '#FFFF00', // Yellow label on focus
          },
        },
      },
    },
  },
});

// Global styles for styled-components
export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: ${({ theme }) => theme.palette.background.default};
    color: ${({ theme }) => theme.palette.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    transition: all 0.3s linear;
  }

  /* Add any other global styles here */
`;

type ThemeName = 'light' | 'dark' | 'high-contrast';

interface ThemeContextType {
  theme: ThemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ProjectThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>('light'); // Default theme

  const muiTheme = useMemo(() => {
    switch (theme) {
      case 'light':
        return lightTheme;
      case 'dark':
        return darkTheme;
      case 'high-contrast':
        return highContrastTheme;
      default:
        return lightTheme;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light')); // Simple toggle for now
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={muiTheme}>
          {children}
        </StyledThemeProvider>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ProjectThemeProvider');
  }
  return context;
};
