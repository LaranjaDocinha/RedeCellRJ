import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SoundProvider } from '../contexts/SoundContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ProjectThemeProvider, GlobalStyle } from '../styles/theme'; // Import ProjectThemeProvider and GlobalStyle

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface TestProvidersProps {
  children: React.ReactNode;
}

export const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectThemeProvider> {/* This provides the theme for styled-components and MUI */}
        <GlobalStyle /> {/* Apply global styles */}
        <SoundProvider>
          <NotificationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NotificationProvider>
        </SoundProvider>
      </ProjectThemeProvider>
    </QueryClientProvider>
  );
};