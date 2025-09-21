
import React, { useState, useEffect, useCallback } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { AppContainer, ContentArea, MainContentArea } from './AppLayout.styled';
import { Outlet } from 'react-router-dom';
import GlobalSearch from './GlobalSearch/GlobalSearch'; // Import the component
import { LanguageSelector } from './LanguageSelector'; // Import LanguageSelector

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false); // State for search modal

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      setSearchOpen(isOpen => !isOpen);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <AppContainer>
      <Topbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} id="main-sidebar" />
      <ContentArea sidebarOpen={isSidebarOpen}>
        <MainContentArea>
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 9999 }}>
            <LanguageSelector />
          </div>
          {/* Temporary Sentry Test Button - Remove after verification */}
          <button
            onClick={() => { throw new Error("Sentry Test Error - This is a test!"); }}
            style={{
              position: 'absolute',
              top: '50px',
              right: '10px',
              zIndex: 9999,
              padding: '5px 10px',
              backgroundColor: '#f99',
              border: '1px solid #c00',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test Sentry
          </button>
          <Outlet />
        </MainContentArea>
      </ContentArea>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </AppContainer>
  );
};

export default AppLayout;
