import type { Meta, StoryObj } from '@storybook/react';
import OrdersTable from '../components/OrdersTable';
import { fn } from '@storybook/test';

const mockOrders = [
  {
    id: 1,
    customer_name: 'João Silva',
    technician_name: 'Carlos',
    status: 'pending',
    created_at: new Date().toISOString(),
    budget_value: 450.00,
  },
  {
    id: 2,
    customer_name: 'Maria Santos',
    technician_name: 'Ana',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    budget_value: 120.00,
  },
];

const meta: Meta<typeof OrdersTable> = {
  title: 'Components/Tables/OrdersTable',
  component: OrdersTable,
  tags: ['autodocs'],
  args: {
    onViewDetails: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OrdersTable>;

export const Default: Story = {
  args: {
    orders: mockOrders as any,
  },
};

export const Empty: Story = {
  args: {
    orders: [],
  },
};
