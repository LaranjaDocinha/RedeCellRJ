import type { Meta, StoryObj } from '@storybook/react';
import DeviceCheckInCanvas from '../components/ServiceOrder/DeviceCheckInCanvas';
import { fn } from '@storybook/test';

const meta: Meta<typeof DeviceCheckInCanvas> = {
  title: 'ServiceOrder/DeviceCheckInCanvas',
  component: DeviceCheckInCanvas,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DeviceCheckInCanvas>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    initialData: '{"lines":[],"width":400,"height":300}', // Mock empty/basic data string
  },
};
