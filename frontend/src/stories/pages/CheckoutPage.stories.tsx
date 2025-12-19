import type { Meta, StoryObj } from '@storybook/react';
import CheckoutPage from '../../pages/CheckoutPage';

const meta = {
  title: 'Pages/CheckoutPage',
  component: CheckoutPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
