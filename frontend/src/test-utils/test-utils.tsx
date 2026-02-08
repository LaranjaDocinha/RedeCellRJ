import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/theme';
import { colors, borderRadius, customShadows } from '../styles/designTokens';

// Criamos um tema completo para testes que une MUI e os tokens customizados
const testTheme = {
  ...lightTheme,
  colors,
  borderRadius,
  customShadows,
  spacing: (factor: number) => `${8 * factor}px`, // Fallback simples para o spacing se necessário
};

// Adicionamos as propriedades de espaçamento que o styled-components espera no projeto
(testTheme as any).spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={lightTheme}>
      <StyledThemeProvider theme={testTheme}>
        {children}
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
