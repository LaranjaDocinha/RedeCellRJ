import type { Meta, StoryObj } from '@storybook/react';
import QuickCreateMenu from '../components/QuickCreateMenu';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';

const theme = {
  colors: {
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    onSurface: '#000000',
  },
  borderRadius: { medium: '4px' },
  shadows: { elevation2: '0 3px 6px rgba(0,0,0,0.16)' },
};

const meta: Meta<typeof QuickCreateMenu> = {
  title: 'Components/Navigation/QuickCreateMenu',
  component: QuickCreateMenu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <MemoryRouter>
            <div style={{ paddingLeft: '200px', paddingTop: '50px' }}>
                <Story />
            </div>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuickCreateMenu>;

export const Default: Story = {};
