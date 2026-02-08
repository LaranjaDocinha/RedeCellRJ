import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, GlobalStyle } from '../src/styles/theme';
import { colors, borderRadius, shadows as customShadows } from '../src/styles/designTokens';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { CartProvider } from '../src/contexts/CartContext';
import { AnimationProvider as CartAnimationProvider } from '../src/contexts/CartAnimationContext';
import { BrandingProvider } from '../src/contexts/BrandingContext';
import { AnimationPreferenceProvider } from '../src/contexts/AnimationPreferenceContext';
import { AuthProvider } from '../src/contexts/AuthContext';

// Create a combined theme for Styled Components similar to how ProjectThemeProvider does it
const styledTheme = {
  ...lightTheme,
  colors,
  borderRadius,
  customShadows,
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  }
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <BrandingProvider>
          <AnimationPreferenceProvider>
            <NotificationProvider>
              <CartProvider>
                <CartAnimationProvider>
                  <MuiThemeProvider theme={lightTheme}>
                    <StyledThemeProvider theme={styledTheme}>
                      <GlobalStyle />
                      <Story />
                    </StyledThemeProvider>
                  </MuiThemeProvider>
                </CartAnimationProvider>
              </CartProvider>
            </NotificationProvider>
          </AnimationPreferenceProvider>
        </BrandingProvider>
      </AuthProvider>
    ),
  ],
};

export default preview;