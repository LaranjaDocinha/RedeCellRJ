import React from 'react';
import { useTheme } from "../hooks/useTheme";
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';
import { StyledTopbar, TopbarBtn, TopbarActions } from './Topbar.styled';
import LanguageSwitcher from './LanguageSwitcher'; // Import LanguageSwitcher

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean; // Add prop to indicate sidebar state
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <StyledTopbar>
      <TopbarBtn 
        onClick={onToggleSidebar} 
        aria-label="Toggle sidebar" 
        aria-expanded={isSidebarOpen} 
        aria-controls="main-sidebar"
      >
        <FaBars />
      </TopbarBtn>
      <TopbarActions>
        <LanguageSwitcher /> {/* Add LanguageSwitcher */}
        <TopbarBtn onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </TopbarBtn>
      </TopbarActions>
    </StyledTopbar>
  );
};

export default Topbar;