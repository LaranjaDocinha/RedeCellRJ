import React from 'react';

import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button aria-label='Toggle theme' className='theme-toggle-btn' onClick={toggleTheme}>
      <div className='icon-wrapper'>
        {theme === 'light' && <i className='sun bx bx-sun'></i>}
        {theme === 'dark' && <i className='moon bx bx-moon'></i>}
        {theme === 'contrast' && <i className='contrast bx bx-adjust'></i>}
      </div>
    </button>
  );
};

export default ThemeToggle;
