import type { Meta, StoryObj } from '@storybook/react';
import ShelfLabelModal from '../components/ProductCatalog/ShelfLabelModal';
import { fn } from '@storybook/test';

const mockProducts = [
    { id: 1, name: 'iPhone 13 128GB Midnight', sku: 'IPH13-128-MID', price: 4500.00 },
    { id: 2, name: 'Samsung Galaxy S22 Ultra 256GB', sku: 'SAM-S22U-256', price: 5200.00 },
];

const meta: Meta<typeof ShelfLabelModal> = {
  title: 'ProductCatalog/Modals/ShelfLabelModal',
  component: ShelfLabelModal,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ShelfLabelModal>;

export const Open: Story = {
  args: {
    open: true,
    products: mockProducts,
  },
};
