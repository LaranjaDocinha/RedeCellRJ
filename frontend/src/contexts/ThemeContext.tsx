import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'; // Import MUI ThemeProvider

import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';

type ThemeName = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeName;
  toggleTheme: () => void;
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
  });

  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    const savedHighContrast = localStorage.getItem('highContrastMode');
    return savedHighContrast === 'true';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('highContrastMode', String(highContrastMode));
  }, [highContrastMode]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    // Disable high contrast mode if theme is changed
    if (highContrastMode) {
      setHighContrastMode(false);
    }
  };

  const toggleHighContrastMode = () => {
    setHighContrastMode((prevMode) => !prevMode);
    // Force dark theme when high contrast is enabled
    if (!highContrastMode && theme !== 'dark') {
      setTheme('dark');
    }
  };

  const currentTheme = highContrastMode ? darkTheme : (theme === 'light' ? lightTheme : darkTheme);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, highContrastMode, toggleHighContrastMode }}>
      <StyledThemeProvider theme={currentTheme}>
        <MuiThemeProvider theme={currentTheme}>
          {children}
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
