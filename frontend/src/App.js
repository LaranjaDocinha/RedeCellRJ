import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './context/ThemeContext';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { GlobalFilterProvider } from './context/GlobalFilterContext';
import router from './router';

// O Zustand não precisa de um Provider no topo da árvore de componentes.
// O store é importado e usado diretamente nos componentes.

function App() {
  return (
    <ThemeProvider>
      <GlobalFilterProvider>
        <BreadcrumbProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'react-hot-toast',
              duration: 4000,
            }}
          />
          <RouterProvider router={router} />
        </BreadcrumbProvider>
      </GlobalFilterProvider>
    </ThemeProvider>
  );
}

export default App;
