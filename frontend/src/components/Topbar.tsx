import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';
import { StyledTopbar, TopbarBtn, TopbarActions } from './Topbar.styled';
import { useBranding } from '../contexts/BrandingContext'; // Import useBranding
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Import new components
import UserMenu from './UserMenu';
import SearchButton from './SearchButton';
import NotificationsDropdown from './NotificationsDropdown';
import QuickCreateMenu from './QuickCreateMenu';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onSearchClick: () => void; // Callback to open search modal
}

const iconAnimation = {
  whileHover: { scale: 1.2, rotate: 0 },
  whileTap: { scale: 0.9 },
};

const Topbar = React.forwardRef<HTMLButtonElement, TopbarProps>(({ onToggleSidebar, isSidebarOpen, onSearchClick }, ref) => {
  const { theme, toggleTheme } = useTheme();
  const { branding } = useBranding(); // Use branding context
  const { t } = useTranslation(); // Use translation hook

  return (
    <StyledTopbar>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TopbarBtn
          onClick={onToggleSidebar}
          aria-label={t('toggle_sidebar')} // Use translation
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
          className="hamburger-btn" // Add class for specific styling if needed
        >
          <motion.div
            {...iconAnimation}
            animate={{ rotate: isSidebarOpen ? 90 : 0 }} // Rotate 90 degrees when sidebar is open
            transition={{ duration: 0.2 }}
          >
            <FaBars />
          </motion.div>
        </TopbarBtn>
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt={branding.appName} style={{ height: '30px', marginRight: '8px' }} />
        )}
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{branding.appName}</h1>
      </div>

      <TopbarActions>
        <SearchButton onClick={onSearchClick} />
        <QuickCreateMenu />
        <NotificationsDropdown />
        <TopbarBtn onClick={toggleTheme} aria-label={t('toggle_theme')}> {/* Use translation */}
          <motion.div {...iconAnimation}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </motion.div>
        </TopbarBtn>
        <UserMenu />
      </TopbarActions>
    </StyledTopbar>
  );
});

export default Topbar;