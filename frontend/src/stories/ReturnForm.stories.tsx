import type { Meta, StoryObj } from '@storybook/react';
import { ReturnForm } from '../components/ReturnForm';

const meta: Meta<typeof ReturnForm> = {
  title: 'Sales/ReturnForm',
  component: ReturnForm,
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
type Story = StoryObj<typeof ReturnForm>;

export const CreateNewReturn: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingReturn: Story = {
  args: {
    initialData: {
      id: 1,
      sale_id: 101,
      reason: 'Defective item',
      items: [
        { product_id: 1, variation_id: 1, quantity: 1 },
        { product_id: 2, variation_id: 3, quantity: 2 },
      ],
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
