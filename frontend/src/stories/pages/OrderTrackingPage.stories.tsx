import type { Meta, StoryObj } from '@storybook/react';
import OrderTrackingPage from '../../pages/OrderTrackingPage';

const meta = {
  title: 'Pages/OrderTrackingPage',
  component: OrderTrackingPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OrderTrackingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
