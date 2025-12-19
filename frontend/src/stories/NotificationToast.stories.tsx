import type { Meta, StoryObj } from '@storybook/react';
import NotificationToast from '../components/NotificationToast';
import { fn } from '@storybook/test';

const meta: Meta<typeof NotificationToast> = {
  title: 'Components/Feedback/NotificationToast',
  component: NotificationToast,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NotificationToast>;

export const Success: Story = {
  args: {
    id: '1',
    message: 'Operation successful!',
    type: 'success',
  },
};

export const Error: Story = {
  args: {
    id: '2',
    message: 'Something went wrong.',
    type: 'error',
  },
};

export const Warning: Story = {
  args: {
    id: '3',
    message: 'Check your inputs.',
    type: 'warning',
  },
};

export const Info: Story = {
  args: {
    id: '4',
    message: 'New update available.',
    type: 'info',
  },
};
