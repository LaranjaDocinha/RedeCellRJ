import React, { useState, useEffect, useCallback } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import WorkspaceBar from './ui/WorkspaceBar';
import AIChatBot from './AIChatBot';
import { AppContainer, ContentArea, MainContentArea } from './AppLayout.styled';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import OmniSearch from './OmniSearch/OmniSearch';
import GuidedTour from './GuidedTour';
import FeedbackButton from './FeedbackButton';
import OfflineIndicator from './OfflineIndicator';
import { offlineSyncService } from '../services/offlineSyncService';
import AccessibilityMenu from './AccessibilityMenu';
import { ProductComparisonBar } from './ProductComparisonBar';
import { CommandPalette } from './ui/CommandPalette';
import { SmartBreadcrumbs } from './ui/SmartBreadcrumbs';
import { NotificationDrawer } from './ui/NotificationDrawer';
import { ScrollProgress } from './ui/ScrollProgress';
import { CursorSpotlight } from './ui/CursorSpotlight';
import ChatWidget from './ui/ChatWidget';

const AppLayout: React.FC = React.memo(() => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCompact, setSidebarCompact] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [tourKey, setTourKey] = useState('dashboardTour');

  const toggleSidebar = useCallback(() => {
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
    { target: '.notifications-bell', content: 'Central de notificações persistente.' },
    { target: '#executive-dashboard-link', content: 'Nova Torre de Controle para análise de BI.' },
    { target: '#print-queue-link', content: 'Fila de produção para Impressão e Xerox.' },
  ];

  const handleRestartTour = () => {
    localStorage.removeItem('dashboardTour');
    setTourKey(`tour_${Date.now()}`);
  };

  return (
    <AppContainer>
      <ScrollProgress />
      <CursorSpotlight />
      <Topbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onSearchClick={() => setSearchOpen(true)}
        onNotificationClick={() => setNotificationDrawerOpen(true)}
        onRestartTour={handleRestartTour}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        isCompact={isSidebarCompact}
        onClose={useCallback(() => setSidebarOpen(false), [])}
        onToggleCompact={() => setSidebarCompact(!isSidebarCompact)}
        id="main-sidebar"
      />
      <ContentArea $sidebarOpen={isSidebarOpen} $isCompact={isSidebarCompact}>
        <WorkspaceBar />
        <MainContentArea>
          <SmartBreadcrumbs />
          <AnimatePresence mode="wait">
            <Outlet location={location} key={location.pathname} />
          </AnimatePresence>
        </MainContentArea>
      </ContentArea>
      <OmniSearch isOpen={isSearchOpen} onClose={useCallback(() => setSearchOpen(false), [])} />
      <GuidedTour tourKey={tourKey} steps={dashboardTourSteps} />
      <OfflineIndicator />
      <ProductComparisonBar />
      <CommandPalette />
      <NotificationDrawer open={isNotificationDrawerOpen} onClose={() => setNotificationDrawerOpen(false)} />
      <AIChatBot />
    </AppContainer>
  );
});

export default AppLayout;
