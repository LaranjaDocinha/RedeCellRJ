import type { Meta, StoryObj } from '@storybook/react';
import { RealtimeNotification } from '../components/RealtimeNotification';

const meta: Meta<typeof RealtimeNotification> = {
  title: 'Common/RealtimeNotification',
  component: RealtimeNotification,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The message to display in the notification',
    },
    type: {
      control: 'select',
      options: ['success', 'error', 'info', 'warning'],
      description: 'Type of notification (for styling)',
    },
    onClose: {
      action: 'notification closed',
      description: 'Callback when the notification is closed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RealtimeNotification>;

export const Success: Story = {
  args: {
    message: 'Operation completed successfully!',
    type: 'success',
  },
};

export const Error: Story = {
  args: {
    message: 'An error occurred during the process.',
    type: 'error',
  },
};

export const Info: Story = {
  args: {
    message: 'New update available.',
    type: 'info',
  },
};

export const Warning: Story = {
  args: {
    message: 'Low stock alert for product X!',
    type: 'warning',
  },
};
