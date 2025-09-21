import type { Meta, StoryObj } from '@storybook/react';
import { CouponList } from '../components/CouponList';

const meta: Meta<typeof CouponList> = {
  title: 'Marketing/CouponList',
  component: CouponList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    coupons: {
      control: 'object',
      description: 'Array of coupon objects',
    },
    onEdit: {
      action: 'edit coupon',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete coupon',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CouponList>;

export const Default: Story = {
  args: {
    coupons: [
      { id: 1, code: 'SAVE10', type: 'percentage', value: 0.10, start_date: '2023-01-01T00:00:00Z', end_date: '2023-12-31T23:59:59Z', is_active: true, uses_count: 5 },
      { id: 2, code: 'FIXED5', type: 'fixed_amount', value: 5.00, start_date: '2023-03-01T00:00:00Z', end_date: '2023-06-30T23:59:59Z', is_active: true, uses_count: 12 },
      { id: 3, code: 'EXPIRED', type: 'percentage', value: 0.15, start_date: '2022-01-01T00:00:00Z', end_date: '2022-01-31T23:59:59Z', is_active: false, uses_count: 20 },
    ],
    onEdit: (id) => console.log(`Edit coupon ${id}`),
    onDelete: (id) => console.log(`Delete coupon ${id}`),
  },
};

export const Empty: Story = {
  args: {
    coupons: [],
    onEdit: (id) => console.log(`Edit coupon ${id}`),
    onDelete: (id) => console.log(`Delete coupon ${id}`),
  },
};
