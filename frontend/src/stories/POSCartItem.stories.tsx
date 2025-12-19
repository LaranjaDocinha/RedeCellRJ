import type { Meta, StoryObj } from '@storybook/react';
import POSCartItem from '../components/POS/POSCartItem';
import { fn } from '@storybook/test';
import { ThemeProvider } from 'styled-components';

const theme = {
    colors: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        border: '#E0E0E0',
        textSecondary: '#666666',
        danger: '#B00020',
    },
    borderRadius: { small: '4px', medium: '8px' },
};

const meta: Meta<typeof POSCartItem> = {
  title: 'POS/Cart/POSCartItem',
  component: POSCartItem,
  tags: ['autodocs'],
  decorators: [
      (Story) => (
          <ThemeProvider theme={theme}>
              <Story />
          </ThemeProvider>
      )
  ],
  args: {
    onUpdateQuantity: fn(),
    onRemove: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof POSCartItem>;

export const Default: Story = {
  args: {
    item: {
      id: 1,
      product_name: 'iPhone 13',
      color: 'Midnight',
      price: '4500.00',
      quantity: 1,
      subtotal: 4500.00,
      image_url: 'https://via.placeholder.com/60',
    },
  },
};
