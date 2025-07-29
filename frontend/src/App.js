import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { GlobalFilterProvider } from './context/GlobalFilterContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import router from './router';
import LoadingBar from './components/Common/LoadingBar';

function App() {
  return (
    <ThemeProvider>
      {' '}
      {/* Wrap with ThemeProvider */}
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
            <RouterProvider router={router} fallbackElement={<LoadingBar />} />
            <LoadingBar />
          </BreadcrumbProvider>
        </GlobalFilterProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  );
}

export default App;
