import React, { createContext, useState, useLayoutEffect, useContext } from 'react';

const PREDEFINED_COLORS = ['#556ee6', '#34c38f', '#f1b44c', '#f46a6a', '#50a5f1'];

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  primaryColor: PREDEFINED_COLORS[0],
  setPrimaryColor: () => {},
  predefinedColors: PREDEFINED_COLORS,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper to convert hex to a string "r, g, b"
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('primaryColor') || PREDEFINED_COLORS[0]);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    const rgb = hexToRgb(primaryColor);
    if (rgb) {
      document.documentElement.style.setProperty('--primary-color-rgb', rgb);
      // Define specific alpha variations needed by the app
      document.documentElement.style.setProperty('--primary-color-10', `rgba(${rgb}, 0.1)`);
      document.documentElement.style.setProperty('--primary-color-15', `rgba(${rgb}, 0.15)`);
      document.documentElement.style.setProperty('--primary-color-25', `rgba(${rgb}, 0.25)`);
    }
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, primaryColor, setPrimaryColor, predefinedColors: PREDEFINED_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};
