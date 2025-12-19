import type { Meta, StoryObj } from '@storybook/react';
import { Countdown } from '../components/Countdown';

const meta: Meta<typeof Countdown> = {
  title: 'Components/Countdown',
  component: Countdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Countdown>;

export const FutureDate: Story = {
  args: {
    targetDate: new Date(Date.now() + 100000000), // ~1 day
  },
};

export const NearDate: Story = {
  args: {
    targetDate: new Date(Date.now() + 5000), // 5 seconds
  },
};
