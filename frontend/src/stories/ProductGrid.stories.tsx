import type { Meta, StoryObj } from '@storybook/react';
import ProductGrid from '../components/ProductCatalog/ProductGrid';
import { fn } from '@storybook/test';

const mockProducts = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    name: `Product ${i + 1}`,
    price: (i + 1) * 10,
    sku: `SKU-${i}`,
    variations: []
}));

const meta: Meta<typeof ProductGrid> = {
  title: 'ProductCatalog/ProductGrid',
  component: ProductGrid,
  tags: ['autodocs'],
  args: {
    onProductClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ProductGrid>;

export const Default: Story = {
  args: {
    products: mockProducts as any[],
  },
};

export const Loading: Story = {
  args: {
    products: [],
    isLoading: true,
  },
};
