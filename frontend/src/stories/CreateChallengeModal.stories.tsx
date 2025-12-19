import type { Meta, StoryObj } from '@storybook/react';
import CreateChallengeModal from '../components/gamification/CreateChallengeModal';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

const meta: Meta<typeof CreateChallengeModal> = {
  title: 'Gamification/Modals/CreateChallengeModal',
  component: CreateChallengeModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <NotificationProvider>
          <Story />
        </NotificationProvider>
      </AuthProvider>
    ),
  ],
  args: {
    onClose: fn(),
    onSuccess: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CreateChallengeModal>;

export const Open: Story = {
  args: {
    open: true,
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
