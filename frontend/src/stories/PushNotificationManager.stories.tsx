import type { Meta, StoryObj } from '@storybook/react';
import PushNotificationManager from '../../components/PushNotificationManager';

const meta = {
  title: 'Components/PushNotificationManager',
  component: PushNotificationManager,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PushNotificationManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
