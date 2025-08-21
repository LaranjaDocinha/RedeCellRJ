
import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

import ErrorBoundary from '../Common/ErrorBoundary';
import { useTheme } from '../../context/ThemeContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { useRouteHandle } from '../../hooks/useRouteHandle';
import { useSpotifyStore } from '../../store/spotifyStore'; // Import the store
import api from '../../utils/api'; // Import api

import Header from './Header';
import Sidebar from './Sidebar';
import GlobalLoadingIndicator from './GlobalLoadingIndicator';
import ImpersonationBanner from '../Common/ImpersonationBanner';

import './Layout.scss';

const Layout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentPageRef = useRef(null);

  const location = useLocation();
  const navigation = useNavigation();
  const handle = useRouteHandle();

  const { theme, backgroundColor } = useTheme();
  const { setBreadcrumbTitle } = useBreadcrumb();
  
  // Spotify Store
  const { hasToken, setHasToken, initializePlayer, disconnect } = useSpotifyStore();

  useEffect(() => {
    const checkTokenAndInitPlayer = async () => {
      try {
        const response = await api.get('/api/spotify/token');
        setHasToken(true);
        initializePlayer(response.data.accessToken);
      } catch (error) {
        setHasToken(false);
        disconnect();
      }
    };

    checkTokenAndInitPlayer();

    // Periodically check for the token
    const interval = setInterval(checkTokenAndInitPlayer, 60000 * 5); // every 5 minutes

    return () => {
        clearInterval(interval);
        disconnect();
    }
  }, [setHasToken, initializePlayer, disconnect]);


  useEffect(() => {
    if (navigation.state === 'loading') {
      window.dispatchEvent(new Event('start-loading'));
    } else {
      window.dispatchEvent(new Event('stop-loading'));
    }
  }, [navigation.state]);

  useEffect(() => {
    if (handle) {
      const { title } = handle;
      setBreadcrumbTitle(title);
    }
  }, [handle, setBreadcrumbTitle]);

  const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div
      className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
    >
      <Particles id='tsparticles' init={particlesInit} options={{ /* ... */ }} />
      <GlobalLoadingIndicator />
      <ImpersonationBanner />
      <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileMenuOpen} />

      {isMobileMenuOpen && (
        <div className='overlay' role='button' tabIndex={0} onClick={toggleMobileMenu} onKeyPress={(e) => e.key === 'Enter' && toggleMobileMenu()}></div>
      )}

      <div className={`main-content ${hasToken ? 'with-player' : ''}`}>
        <Header onToggleMobileMenu={toggleMobileMenu} onToggleSidebar={toggleSidebar} />

        <div className='content-page' ref={contentPageRef}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={location.pathname}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              style={{ width: '100%', height: '100%' }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={null}>
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
        
        </div>

      {hasToken && (
          <footer className="app-footer">
              
          </footer>
      )}
    </div>
  );
};

export default Layout;
