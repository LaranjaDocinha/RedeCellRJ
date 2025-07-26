import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import GlobalLoadingIndicator from './GlobalLoadingIndicator';
import FullPageLoader from './FullPageLoader'; // Importar o loader
import './Layout.scss';

const Layout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Fecha o menu mobile ao navegar para uma nova página
    setMobileMenuOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <GlobalLoadingIndicator />
      <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileMenuOpen} />
      
      {isMobileMenuOpen && <div className="overlay" onClick={toggleMobileMenu}></div>}

      <div className="main-content">
        <Header onToggleSidebar={toggleSidebar} onToggleMobileMenu={toggleMobileMenu} />
        <div className="content-page">
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Layout;
