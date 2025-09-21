import type { Meta, StoryObj } from '@storybook/react';
import { ProductKitList } from '../components/ProductKitList';

const meta: Meta<typeof ProductKitList> = {
  title: 'Product/ProductKitList',
  component: ProductKitList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    kits: {
      control: 'object',
      description: 'Array of product kit objects',
    },
    onEdit: {
      action: 'edit kit',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete kit',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProductKitList>;

export const Default: Story = {
  args: {
    kits: [
      { id: 1, name: 'Starter Pack', description: 'Phone + Case', price: 500.00, is_active: true, items: [{ product_id: 1, variation_id: 1, quantity: 1 }] },
      { id: 2, name: 'Pro Bundle', description: 'Phone + Case + Charger', price: 750.00, is_active: true, items: [{ product_id: 2, variation_id: 2, quantity: 1 }] },
    ],
    onEdit: (id) => console.log(`Edit kit ${id}`),
    onDelete: (id) => console.log(`Delete kit ${id}`),
  },
};

export const Empty: Story = {
  args: {
    kits: [],
    onEdit: (id) => console.log(`Edit kit ${id}`),
    onDelete: (id) => console.log(`Delete kit ${id}`),
  },
};
