import React, { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const themeMode = useThemeStore((state) => state.theme.mode);

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${themeMode}-mode`);
  }, [themeMode]);

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Toggle theme"
    >
      <div className="icon-wrapper">
        <i className="sun bx bx-sun"></i>
        <i className="moon bx bx-moon"></i>
      </div>
    </button>
  );
};

export default ThemeToggle;
