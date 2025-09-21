import type { Meta, StoryObj } from '@storybook/react';
import { DiscountForm } from '../components/DiscountForm';

const meta: Meta<typeof DiscountForm> = {
  title: 'Marketing/DiscountForm',
  component: DiscountForm,
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
type Story = StoryObj<typeof DiscountForm>;

export const CreateNewDiscount: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingDiscount: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'Black Friday',
      type: 'percentage',
      value: 0.20,
      start_date: '2023-11-20T00:00:00Z',
      end_date: '2023-11-27T23:59:59Z',
      min_purchase_amount: 50.00,
      max_uses: 100,
      is_active: true,
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
