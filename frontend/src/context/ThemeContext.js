import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const [primaryColor, setPrimaryColorState] = useState(() => {
    const savedColor = localStorage.getItem('primaryColor');
    return savedColor || '#007bff'; // Default primary color
  });

  const [primaryFont, setPrimaryFontState] = useState(() => {
    const savedFont = localStorage.getItem('primaryFont');
    return savedFont || 'Inter'; // Default primary font
  });

  const [secondaryFont, setSecondaryFontState] = useState(() => {
    const savedFont = localStorage.getItem('secondaryFont');
    return savedFont || 'Roboto'; // Default secondary font
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(primaryColor));
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-primary', primaryFont);
    localStorage.setItem('primaryFont', primaryFont);
  }, [primaryFont]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-secondary', secondaryFont);
    localStorage.setItem('secondaryFont', secondaryFont);
  }, [secondaryFont]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const setPrimaryColor = useCallback((color) => {
    setPrimaryColorState(color);
  }, []);

  const setPrimaryFont = useCallback((font) => {
    setPrimaryFontState(font);
  }, []);

  const setSecondaryFont = useCallback((font) => {
    setSecondaryFontState(font);
  }, []);

  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : null;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        primaryColor,
        setPrimaryColor,
        primaryFont,
        setPrimaryFont,
        secondaryFont,
        setSecondaryFont,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
