import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SoundProvider } from '../contexts/SoundContext';
import { AnimationPreferenceProvider } from '../contexts/AnimationPreferenceContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { BrandingProvider } from '../contexts/BrandingContext';
import { CartProvider } from '../contexts/CartContext';
import { AnimationProvider as CartAnimationProvider } from '../contexts/CartAnimationContext';
import { SocketProvider } from '../contexts/SocketContext';
import { InactivityTrackerProvider } from '../contexts/InactivityTrackerContext';

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // turns retries off for tests
    },
  },
});

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <AuthProvider>
                <NotificationProvider>
                    <SoundProvider>
                        <AnimationPreferenceProvider>
                            <BrandingProvider>
                                <CartProvider>
                                    <CartAnimationProvider>
                                        <SocketProvider>
                                            <InactivityTrackerProvider>
                                                {children}
                                            </InactivityTrackerProvider>
                                        </SocketProvider>
                                    </CartAnimationProvider>
                                </CartProvider>
                            </BrandingProvider>
                        </AnimationPreferenceProvider>
                    </SoundProvider>
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything from testing-library
export * from '@testing-library/react';

// override the render method
export { customRender as render };
