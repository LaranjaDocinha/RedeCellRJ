import type { Meta, StoryObj } from '@storybook/react';
import { ProductInfo } from '../components/ProductInfo';
import { fn } from '@storybook/test';

const mockProduct = {
  id: 1,
  name: 'iPhone 13 128GB',
  price: 4500.00,
  description: 'O iPhone 13 traz um sistema de câmera dupla avançado...',
  rating: 4.5,
  reviews: 120,
  stock: 50,
  variations: [
    { id: 101, color: 'Midnight', price: 4500.00, stock_quantity: 20, image_url: 'https://via.placeholder.com/300/000000' },
    { id: 102, color: 'Starlight', price: 4500.00, stock_quantity: 15, image_url: 'https://via.placeholder.com/300/CCCCCC' },
    { id: 103, color: 'Blue', price: 4600.00, stock_quantity: 15, image_url: 'https://via.placeholder.com/300/0000FF' },
  ],
};

const meta: Meta<typeof ProductInfo> = {
  title: 'Components/Product/ProductInfo',
  component: ProductInfo,
  tags: ['autodocs'],
  args: {
    onChangeSelectedVariation: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ProductInfo>;

export const Default: Story = {
  args: {
    product: mockProduct as any,
  },
};
