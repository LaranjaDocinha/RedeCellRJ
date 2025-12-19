import type { Meta, StoryObj } from '@storybook/react';
import NotificationsDropdown from '../components/NotificationsDropdown';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    surface: '#FFFFFF',
    outlineVariant: '#E0E0E0',
  },
  borderRadius: { medium: '4px' },
  shadows: { elevation2: '0 3px 6px rgba(0,0,0,0.16)' },
};

const meta: Meta<typeof NotificationsDropdown> = {
  title: 'Components/Navigation/NotificationsDropdown',
  component: NotificationsDropdown,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ paddingLeft: '200px', paddingTop: '50px' }}>
            <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NotificationsDropdown>;

export const Default: Story = {};
