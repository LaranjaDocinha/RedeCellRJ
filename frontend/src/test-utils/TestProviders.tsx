import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { SoundProvider } from '../contexts/SoundContext';
import { BrandingProvider } from '../contexts/BrandingContext';
import { AnimationPreferenceProvider } from '../contexts/AnimationPreferenceContext';
import { InactivityTrackerProvider } from '../contexts/InactivityTrackerContext';
import { AnimationProvider as CartAnimationProvider } from '../contexts/CartAnimationContext';
import { ProjectThemeProvider } from '../styles/theme';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const TestProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <BrandingProvider>
            <AnimationPreferenceProvider>
              <SoundProvider>
                <InactivityTrackerProvider>
                  <WorkspaceProvider>
                    <CartAnimationProvider>
                      <ProjectThemeProvider>
                        {children}
                      </ProjectThemeProvider>
                    </CartAnimationProvider>
                  </WorkspaceProvider>
                </InactivityTrackerProvider>
              </SoundProvider>
            </AnimationPreferenceProvider>
          </BrandingProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};
