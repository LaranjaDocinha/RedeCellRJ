import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  const { toggleTheme } = useTheme();

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
