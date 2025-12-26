import { createTheme, ThemeOptions, Theme as MuiTheme, Shadows } from '@mui/material/styles';
import { colors, typography, spacing, shadows as customShadows, borderRadius } from './designTokens';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';

// Extend the Theme interface
declare module '@mui/material/styles' {
  interface Theme {
    name: string;
    borderRadius: typeof borderRadius;
    customShadows: typeof customShadows;
    colors: typeof colors;
  }
  interface ThemeOptions {
    name?: string;
    borderRadius?: typeof borderRadius;
    customShadows?: typeof customShadows;
    colors?: typeof colors;
  }
}

declare module 'styled-components' {
  export interface DefaultTheme extends MuiTheme {
    colors: typeof colors;
    borderRadius: typeof borderRadius;
    customShadows: typeof customShadows;
  }
}

const muiShadows: Shadows = Array(25).fill('none') as Shadows;
muiShadows[0] = 'none';
muiShadows[1] = customShadows.elevation1;
muiShadows[2] = customShadows.elevation2;

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
  shadows: muiShadows,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  borderRadius,
  customShadows,
  colors,
  components: {
    // Reverted to default to avoid ARIA conflicts
  },
};

const getThemeWithBranding = (mode: 'light' | 'dark', primaryColor: string) => {
  return createTheme({
    ...commonThemeOptions,
    palette: {
      mode,
      primary: {
        main: primaryColor || (mode === 'light' ? '#1976d2' : '#90caf9'),
        contrastText: mode === 'light' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
      },
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#1a1a1a' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#aaaaaa',
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
    },
  });
};

export const lightTheme = getThemeWithBranding('light', '#1976d2');
export const darkTheme = getThemeWithBranding('dark', '#90caf9');

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: ${({ theme }) => theme.palette.background.default};
    color: ${({ theme }) => theme.palette.text.primary};
    font-family: var(--font-family, 'Inter', 'Roboto', sans-serif);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    font-family: inherit;
  }
`;

type ThemeName = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ProjectThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
  });
  const { branding } = useBranding();

  useEffect(() => {
    if (user?.theme_preference) {
      setThemeName(user.theme_preference as ThemeName);
      localStorage.setItem('theme', user.theme_preference);
    }
  }, [user]);

  const muiTheme = useMemo(() => {
    return getThemeWithBranding(themeName, branding.primaryColor);
  }, [themeName, branding.primaryColor]);

  // Merge MUI theme with additional properties for Styled Components
  const styledTheme = useMemo(() => {
    return {
      ...muiTheme,
      colors,
      borderRadius,
      customShadows,
    };
  }, [muiTheme]);

  const toggleTheme = async () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newTheme);
    localStorage.setItem('theme', newTheme);

    if (token) {
      try {
        await fetch('/api/users/me/theme', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme: newTheme })
        });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themeName, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={styledTheme}>
          <GlobalStyle />
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