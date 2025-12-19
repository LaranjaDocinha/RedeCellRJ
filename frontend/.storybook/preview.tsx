import type { Preview } from '@storybook/react-webpack5';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../src/styles/theme'; // Ajuste o caminho conforme necessário
import { GlobalStyle } from '../src/styles/globalStyles'; // Ajuste o caminho conforme necessário

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;