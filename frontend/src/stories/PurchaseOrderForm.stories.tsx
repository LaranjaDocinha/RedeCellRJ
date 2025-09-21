import type { Meta, StoryObj } from '@storybook/react';
import { PurchaseOrderForm } from '../components/PurchaseOrderForm';

const meta: Meta<typeof PurchaseOrderForm> = {
  title: 'Inventory/PurchaseOrderForm',
  component: PurchaseOrderForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialData: {
      control: 'object',
      description: 'Initial data for the form (for editing)',
    },
    onSubmit: {
      action: 'submit form',
      description: 'Callback when form is submitted',
    },
    onCancel: {
      action: 'cancel form',
      description: 'Callback when form is cancelled',
    },
    suppliers: {
      control: 'object',
      description: 'Array of available suppliers',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PurchaseOrderForm>;

export const CreateNewPurchaseOrder: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
    suppliers: [
      { id: 1, name: 'Supplier A' },
      { id: 2, name: 'Supplier B' },
    ],
  },
};

export const EditExistingPurchaseOrder: Story = {
  args: {
    initialData: {
      id: 1,
      supplier_id: 1,
      expected_delivery_date: '2023-01-15T10:00:00Z',
      status: 'pending',
      items: [
        { product_id: 1, variation_id: 1, quantity: 10, unit_price: 50.00 },
        { product_id: 2, variation_id: 2, quantity: 5, unit_price: 100.00 },
      ],
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
    suppliers: [
      { id: 1, name: 'Supplier A' },
      { id: 2, name: 'Supplier B' },
    ],
  },
};
