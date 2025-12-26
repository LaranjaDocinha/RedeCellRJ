import React, { useState, useEffect, useCallback } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { AppContainer, ContentArea, MainContentArea } from './AppLayout.styled';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import GlobalSearch from './GlobalSearch/GlobalSearch';
import GuidedTour from './GuidedTour';
import FeedbackButton from './FeedbackButton';
import OfflineIndicator from './OfflineIndicator';
import { offlineSyncService } from '../services/offlineSyncService';
import AccessibilityMenu from './AccessibilityMenu';
import { ProductComparisonBar } from './ProductComparisonBar';

const AppLayout: React.FC = React.memo(() => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCompact, setSidebarCompact] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    // Se a tela for pequena, fechamos/abrimos. Se for grande, compactamos/expandimos.
    if (window.innerWidth < 768) {
      setSidebarOpen(prev => !prev);
    } else {
      setSidebarCompact(prev => !prev);
    }
  }, []);

  useEffect(() => {
    offlineSyncService.init();
  }, []);

  const dashboardTourSteps = [
    { target: '#main-sidebar', content: 'Navegue pelo sistema usando a barra lateral.' },
    { target: '#pos-link', content: 'Acesse o Ponto de Venda aqui.' },
  ];

  return (
    <AppContainer>
      <Topbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onSearchClick={() => setSearchOpen(true)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        isCompact={isSidebarCompact}
        onClose={useCallback(() => setSidebarOpen(false), [])}
        onToggleCompact={() => setSidebarCompact(!isSidebarCompact)}
        id="main-sidebar"
      />
      <ContentArea $sidebarOpen={isSidebarOpen} $isCompact={isSidebarCompact}>
        <MainContentArea>
          <AnimatePresence mode="wait">
            <Outlet location={location} key={location.pathname} />
          </AnimatePresence>
        </MainContentArea>
      </ContentArea>
      <GlobalSearch $isOpen={isSearchOpen} onClose={useCallback(() => setSearchOpen(false), [])} />
      <GuidedTour tourKey="dashboardTour" steps={dashboardTourSteps} />
      <OfflineIndicator />
      <ProductComparisonBar />
    </AppContainer>
  );
});

export default AppLayout;