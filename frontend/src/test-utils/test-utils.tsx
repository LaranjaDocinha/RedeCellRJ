import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnimationPreferenceProvider } from '../contexts/AnimationPreferenceContext';
import { AnimationProvider as CartAnimationProvider } from '../contexts/CartAnimationContext';
import { CartProvider } from '../contexts/CartContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { BrandingProvider, BrandingContextType, BrandingContext } from '../contexts/BrandingContext';
import { SocketProvider, SocketContext } from '../contexts/SocketContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock BrandingProvider to avoid real fetch calls in tests
const MockBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockBranding: BrandingContextType = {
    branding: {
      logoUrl: '/mock-logo.png',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      fontFamily: 'Arial',
      faviconUrl: '/mock-favicon.ico',
      appName: 'Mock App',
    },
    loading: false,
    error: null,
  };
  return (
    <BrandingContext.Provider value={mockBranding}>
      {children}
    </BrandingContext.Provider>
  );
};

// Mock SocketProvider to avoid real WebSocket connections in tests
const MockSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockSocket = {
    socket: null,
    isConnected: false,
  };
  return (
    <SocketContext.Provider value={mockSocket}>
      {children}
    </SocketContext.Provider>
  );
};

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <AnimationPreferenceProvider>
            <CartAnimationProvider>
              <CartProvider>
                <NotificationProvider>
                  <MockBrandingProvider>
                    <MockSocketProvider>{children}</MockSocketProvider>
                  </MockBrandingProvider>
                </NotificationProvider>
              </CartProvider>
            </CartAnimationProvider>
          </AnimationPreferenceProvider>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };