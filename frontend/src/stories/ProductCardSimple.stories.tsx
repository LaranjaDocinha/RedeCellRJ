import type { Meta, StoryObj } from '@storybook/react';
import { ProductCardSimple } from '../components/ProductCardSimple';
import { fn } from '@storybook/test';

const meta: Meta<typeof ProductCardSimple> = {
  title: 'Components/Cards/ProductCardSimple',
  component: ProductCardSimple,
  tags: ['autodocs'],
  args: {
    onAddToCart: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ProductCardSimple>;

export const Default: Story = {
  args: {
    id: '1',
    name: 'iPhone 13',
    price: 4500.00,
    imageUrl: 'https://via.placeholder.com/200',
    rating: 4.5,
  },
};
