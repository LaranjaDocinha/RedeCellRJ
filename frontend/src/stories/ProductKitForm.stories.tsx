import type { Meta, StoryObj } from '@storybook/react';
import { ProductKitForm } from '../components/ProductKitForm';

const meta: Meta<typeof ProductKitForm> = {
  title: 'Product/ProductKitForm',
  component: ProductKitForm,
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
  },
};

export default meta;
type Story = StoryObj<typeof ProductKitForm>;

export const CreateNewProductKit: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingProductKit: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'Starter Pack',
      description: 'Phone + Case',
      price: 500.00,
      is_active: true,
      items: [
        { product_id: 1, variation_id: 1, quantity: 1 },
        { product_id: 2, variation_id: 2, quantity: 1 },
      ],
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
