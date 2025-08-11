import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react'; // Added useRef
import { Outlet, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
// import { Nav, NavItem, NavLink } from 'reactstrap'; // Removed
// import { X } from 'react-feather'; // Removed

import ErrorBoundary from '../Common/ErrorBoundary';
// import ConfirmationModal from '../Common/ConfirmationModal'; // Removed
import { useTheme } from '../../context/ThemeContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
// import { useTabs } from '../../hooks/useTabs'; // Removed
import { useRouteHandle } from '../../hooks/useRouteHandle';
// import { useDirtyForm } from '../../hooks/useDirtyForm'; // Removed

import Header from './Header';
import Sidebar from './Sidebar';
import GlobalLoadingIndicator from './GlobalLoadingIndicator';
import ImpersonationBanner from '../Common/ImpersonationBanner';
import './Layout.scss';

const Layout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [blockerModalOpen, setBlockerModalOpen] = useState(false); // Removed
  const contentPageRef = useRef(null); // Ref for content-page div
  // const [nextTab, setNextTab] = useState(null); // Removed

  const location = useLocation();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const handle = useRouteHandle();

  const { theme, backgroundColor } = useTheme(); // Get theme and backgroundColor from context
  const { setBreadcrumbTitle } = useBreadcrumb();
  // const { tabs, activeTab, addTab, removeTab, setActiveTab } = useTabs(); // Removed
  // const { isDirty, message: dirtyMessage, reset: resetDirtyForm } = useDirtyForm(); // Removed

  useEffect(() => {
    if (navigation.state === 'loading') {
      window.dispatchEvent(new Event('start-loading'));
    } else {
      window.dispatchEvent(new Event('stop-loading'));
    }
  }, [navigation.state]);

  useEffect(() => {
    if (handle) {
      const { title } = handle; // Removed icon as it's not used for tabs anymore
      setBreadcrumbTitle(title);
      // addTab({ id, path: id, title, icon: icon || 'file-blank' }); // Removed
    }
  }, [handle, setBreadcrumbTitle]); // Removed location, addTab

  // Removed useEffect for activeTab navigation

  // Removed handleTabClick
  // Removed handleConfirmNavigation
  // Removed handleCloseTab

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

      <div className='main-content'>
        <Header onToggleMobileMenu={toggleMobileMenu} onToggleSidebar={toggleSidebar} />

        {/* Removed tab-navigation div */}

        <div className='content-page' ref={contentPageRef}> {/* Added ref */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={location.pathname} // Use location.pathname as key for AnimatePresence
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
      {/* Removed ConfirmationModal */}
    </div>
  );
};

export default Layout;