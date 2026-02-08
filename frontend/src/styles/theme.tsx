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
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 400,
    fontWeightBold: 400,
    h1: { ...typography.displayLarge, fontWeight: 400 },
    h2: { ...typography.displayMedium, fontWeight: 400 },
    h3: { ...typography.displaySmall, fontWeight: 400 },
    h4: { ...typography.headlineLarge, fontWeight: 400 },
    h5: { ...typography.headlineMedium, fontWeight: 400 },
    h6: { ...typography.headlineSmall, fontWeight: 400 },
    subtitle1: { ...typography.titleLarge, fontWeight: 400 },
    subtitle2: { ...typography.titleMedium, fontWeight: 400 },
    body1: { ...typography.bodyLarge, fontWeight: 400 },
    body2: { ...typography.bodyMedium, fontWeight: 400 },
    button: { ...typography.labelLarge, fontWeight: 400, textTransform: 'none' },
    caption: { ...typography.bodySmall, fontWeight: 400 },
    overline: { ...typography.labelSmall, fontWeight: 400 },
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px) saturate(180%)',
          color: 'inherit',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '10px 16px',
          fontSize: '0.85rem',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
        arrow: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
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
    // Glassmorphism Utilities
    glass: {
        background: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 30, 30, 0.7)',
        border: mode === 'light' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        blur: 'blur(12px)',
    }
  } as any);
};

export const lightTheme = getThemeWithBranding('light', '#1976d2');
export const darkTheme = getThemeWithBranding('dark', '#90caf9');

export const GlobalStyle = createGlobalStyle`
  @keyframes aurora-1 {
    0% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(100px, 100px, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }
  @keyframes aurora-2 {
    0% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(-150px, 50px, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }

  @font-face {
    font-family: 'Inter';
    src: url('https://fonts.googleapis.com/css2?family=Inter:slnt,wght@-10..0,100..900&display=swap');
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    background-color: ${(props: any) => props.theme.palette.background.default};
  }

  body {
    background-color: ${(props: any) => props.theme.palette.background.default};
    color: ${(props: any) => props.theme.palette.text.primary};
    font-family: 'Inter', var(--font-family, sans-serif);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease;
    overflow-x: hidden;
    position: relative;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }

  /* Aurora Background Blobs */
  body::after {
    content: "";
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    z-index: -1;
    opacity: ${(props: any) => props.theme.palette.mode === 'dark' ? 0.15 : 0.05};
    background: 
      radial-gradient(circle at 20% 30%, ${(props: any) => props.theme.palette.primary.main} 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, ${(props: any) => props.theme.palette.secondary?.main || '#f0f'} 0%, transparent 40%);
    filter: blur(120px);
    pointer-events: none;
    animation: aurora-1 20s infinite alternate linear;
  }

  /* Analog Noise Texture Overlay */
  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0.02;
    pointer-events: none;
    z-index: 9999;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props: any) => props.theme.palette.background.default};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props: any) => props.theme.palette.divider};
    border-radius: 10px;
    border: 2px solid ${(props: any) => props.theme.palette.background.default};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${(props: any) => props.theme.palette.text.disabled};
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
  
  // Detecção correta do tema do sistema
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    
    // Se não tiver salvo, usa a preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Listener para mudança de tema do sistema em tempo real
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setThemeName(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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

  const styledTheme = useMemo(() => {
    return {
      ...muiTheme,
      themeName, // Add this line
      colors,
      borderRadius,
      customShadows,
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      }
    };
  }, [muiTheme, themeName]);

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
