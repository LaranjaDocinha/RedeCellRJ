import type { Meta, StoryObj } from '@storybook/react';
import { CouponForm } from '../components/CouponForm';

const meta: Meta<typeof CouponForm> = {
  title: 'Marketing/CouponForm',
  component: CouponForm,
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
type Story = StoryObj<typeof CouponForm>;

export const CreateNewCoupon: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingCoupon: Story = {
  args: {
    initialData: {
      id: 1,
      code: 'SAVE10',
      type: 'percentage',
      value: 0.10,
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2023-12-31T23:59:59Z',
      min_purchase_amount: 20.00,
      max_uses: 50,
      is_active: true,
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
