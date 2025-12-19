import type { Meta, StoryObj } from '@storybook/react';
import LockScreen from '../components/LockScreen';
import { AuthProvider } from '../contexts/AuthContext';
import { InactivityTrackerProvider } from '../contexts/InactivityTrackerContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    primary: '#BB86FC',
  },
  borderRadius: { large: '8px' },
  shadows: { elevation2: '0 3px 6px rgba(0,0,0,0.5)' },
};

const meta: Meta<typeof LockScreen> = {
  title: 'Components/Security/LockScreen',
  component: LockScreen,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <AuthProvider>
            <InactivityTrackerProvider>
              <Story />
            </InactivityTrackerProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
      layout: 'fullscreen',
  }
};

export default meta;
type Story = StoryObj<typeof LockScreen>;

export const Default: Story = {};
