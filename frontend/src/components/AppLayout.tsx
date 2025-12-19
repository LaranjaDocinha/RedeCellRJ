import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const AppLayout: React.FC = React.memo(() => {
  const location = useLocation();
  // ... (rest of code)
  
  useEffect(() => {
    offlineSyncService.init();
  }, []);

  return (
    <AppContainer>
      <Topbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onSearchClick={() => setSearchOpen(true)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={useCallback(() => setSidebarOpen(false), [])}
        id="main-sidebar"
      />
      <ContentArea $sidebarOpen={isSidebarOpen}>
        <MainContentArea>
          <AnimatePresence mode="wait">
            <Outlet location={location} key={location.pathname} />
          </AnimatePresence>
        </MainContentArea>
      </ContentArea>
      <GlobalSearch $isOpen={isSearchOpen} onClose={useCallback(() => setSearchOpen(false), [])} />
      <GuidedTour tourKey="dashboardTour" steps={dashboardTourSteps} />
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 10000 }}>
        <FeedbackButton />
      </div>
      <OfflineIndicator />
      <AccessibilityMenu />
    </AppContainer>
  );
});

export default AppLayout;