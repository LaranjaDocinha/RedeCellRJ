import type { Meta, StoryObj } from '@storybook/react';
import POSProductCard from '../components/POS/POSProductCard';
import { fn } from '@storybook/test';
import { ThemeProvider } from 'styled-components';

const theme = {
    colors: {
        surface: '#FFFFFF',
        border: '#E0E0E0',
        textSecondary: '#666666',
        primary: '#6200EE',
    },
    shadows: { small: '0 2px 4px rgba(0,0,0,0.1)', large: '0 4px 8px rgba(0,0,0,0.2)' },
    borderRadius: { medium: '8px' },
};

const meta: Meta<typeof POSProductCard> = {
  title: 'POS/Products/POSProductCard',
  component: POSProductCard,
  tags: ['autodocs'],
  decorators: [
      (Story) => (
          <ThemeProvider theme={theme}>
              <div style={{ width: '200px' }}>
                <Story />
              </div>
          </ThemeProvider>
      )
  ],
  args: {
    onAddToCart: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof POSProductCard>;

export const Default: Story = {
  args: {
    product: {
      id: 1,
      product_id: 101,
      product_name: 'Samsung S22',
      color: 'Black',
      price: '3200.00',
      stock_quantity: 10,
      image_url: 'https://via.placeholder.com/150',
    },
  },
};
