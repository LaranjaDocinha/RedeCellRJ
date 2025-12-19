import type { Meta, StoryObj } from '@storybook/react';
import SearchButton from '../components/SearchButton';
import { fn } from '@storybook/test';
import { ThemeProvider } from 'styled-components';

const theme = {
    colors: {
        text: '#000000',
        surfaceVariant: '#E0E0E0',
    }
};

const meta: Meta<typeof SearchButton> = {
  title: 'Components/UI/SearchButton',
  component: SearchButton,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  decorators: [
      (Story) => (
          <ThemeProvider theme={theme}>
              <Story />
          </ThemeProvider>
      )
  ]
};

export default meta;
type Story = StoryObj<typeof SearchButton>;

export const Default: Story = {};
