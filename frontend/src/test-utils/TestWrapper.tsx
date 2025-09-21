import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/theme'; // Adjust path as needed
import { GlobalStyle } from '../styles/globalStyles'; // Adjust path as needed

import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={lightTheme}>
            <GlobalStyle />
            {children}
          </ThemeProvider>
        </I18nextProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

export * from '@testing-library/react';
export { customRender as render };
