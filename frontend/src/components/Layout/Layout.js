import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import Header from './Header';
import Sidebar from './Sidebar';
import GlobalLoadingIndicator from './GlobalLoadingIndicator';
import FullPageLoader from './FullPageLoader'; // Importar o loader
import { useThemeStore } from '../../store/themeStore'; // Importar o themeStore
import './Layout.scss';

const Layout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const applyCssVariables = useThemeStore((state) => state.applyCssVariables);
  const themeMode = useThemeStore((state) => state.theme.mode);

  useEffect(() => {
    // Fecha o menu mobile ao navegar para uma nova página
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    applyCssVariables();
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [applyCssVariables, themeMode]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // console.log("Particles container loaded", container);
  }, []);

  

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <GlobalLoadingIndicator />
      <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileMenuOpen} />
      
      {isMobileMenuOpen && <div className="overlay" onClick={toggleMobileMenu} role="button" tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleMobileMenu(); } }}></div>}

      <div className="main-content">
        <Header onToggleSidebar={toggleSidebar} onToggleMobileMenu={toggleMobileMenu} />
        <div className="content-page">
          <div style={{ width: '100%', height: '100%' }}>
              <Suspense fallback={<FullPageLoader />}>
                <Outlet />
              </Suspense>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
