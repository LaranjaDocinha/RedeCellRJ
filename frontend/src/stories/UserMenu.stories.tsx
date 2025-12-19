import type { Meta, StoryObj } from '@storybook/react';
import UserMenu from '../components/UserMenu';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';

const theme = {
    colors: {
        surface: '#FFFFFF',
        surfaceVariant: '#F5F5F5',
        onSurface: '#000000',
        primary: '#6200EE',
        error: '#B00020',
        errorContainer: '#FCD8DF'
    },
    borderRadius: { medium: '4px' },
    shadows: { elevation2: '0 3px 6px rgba(0,0,0,0.16)' },
};

const meta: Meta<typeof UserMenu> = {
  title: 'Components/Navigation/UserMenu',
  component: UserMenu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <MemoryRouter>
            <AuthProvider>
                <div style={{ paddingLeft: '200px', paddingTop: '50px' }}>
                    <Story />
                </div>
            </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {};
