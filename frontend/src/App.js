import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { GlobalFilterProvider } from './context/GlobalFilterContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { ThemeProvider } from './context/ThemeContext';
import router from './router';
import LoadingBar from './components/Common/LoadingBar';
import setupAxiosInterceptors from './helpers/api_client';

// Configura os interceptadores do Axios globalmente
setupAxiosInterceptors();

function App() {
  return (
    <ThemeProvider>
      <FeatureFlagProvider>
        <GlobalFilterProvider>
          <BreadcrumbProvider>
            <Toaster
              position='top-right'
              toastOptions={{
                className: 'react-hot-toast',
                duration: 4000,
              }}
            />
            <RouterProvider fallbackElement={<LoadingBar />} router={router} />
            <LoadingBar />
          </BreadcrumbProvider>
        </GlobalFilterProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  );
}

export default App;
