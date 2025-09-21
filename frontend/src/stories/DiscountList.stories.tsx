import type { Meta, StoryObj } from '@storybook/react';
import { DiscountList } from '../components/DiscountList';

const meta: Meta<typeof DiscountList> = {
  title: 'Marketing/DiscountList',
  component: DiscountList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    discounts: {
      control: 'object',
      description: 'Array of discount objects',
    },
    onEdit: {
      action: 'edit discount',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete discount',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DiscountList>;

export const Default: Story = {
  args: {
    discounts: [
      { id: 1, name: 'Black Friday', type: 'percentage', value: 0.20, start_date: '2023-11-20T00:00:00Z', end_date: '2023-11-27T23:59:59Z', is_active: true },
      { id: 2, name: 'Christmas Sale', type: 'fixed_amount', value: 10.00, start_date: '2023-12-10T00:00:00Z', end_date: '2023-12-25T23:59:59Z', is_active: true },
      { id: 3, name: 'Expired Discount', type: 'percentage', value: 0.05, start_date: '2023-01-01T00:00:00Z', end_date: '2023-01-31T23:59:59Z', is_active: false },
    ],
    onEdit: (id) => console.log(`Edit discount ${id}`),
    onDelete: (id) => console.log(`Delete discount ${id}`),
  },
};

export const Empty: Story = {
  args: {
    discounts: [],
    onEdit: (id) => console.log(`Edit discount ${id}`),
    onDelete: (id) => console.log(`Delete discount ${id}`),
  },
};
