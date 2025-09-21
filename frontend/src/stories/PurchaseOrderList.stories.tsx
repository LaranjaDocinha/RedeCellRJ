import type { Meta, StoryObj } from '@storybook/react';
import { PurchaseOrderList } from '../components/PurchaseOrderList';

const meta: Meta<typeof PurchaseOrderList> = {
  title: 'Inventory/PurchaseOrderList',
  component: PurchaseOrderList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orders: {
      control: 'object',
      description: 'Array of purchase order objects',
    },
    onViewDetails: {
      action: 'view details',
      description: 'Callback when view details button is clicked',
    },
    onUpdateStatus: {
      action: 'update status',
      description: 'Callback when update status button is clicked',
    },
    onReceiveItems: {
      action: 'receive items',
      description: 'Callback when receive items button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PurchaseOrderList>;

export const Default: Story = {
  args: {
    orders: [
      { id: 1, supplier_id: 1, order_date: '2023-01-01T10:00:00Z', expected_delivery_date: '2023-01-15T10:00:00Z', status: 'pending', total_amount: 1500.00 },
      { id: 2, supplier_id: 2, order_date: '2023-01-05T11:00:00Z', expected_delivery_date: '2023-01-20T11:00:00Z', status: 'ordered', total_amount: 2500.00 },
      { id: 3, supplier_id: 1, order_date: '2023-01-10T12:00:00Z', expected_delivery_date: '2023-01-25T12:00:00Z', status: 'received', total_amount: 1000.00 },
    ],
    onViewDetails: (id) => console.log(`View details for order ${id}`),
    onUpdateStatus: (id, status) => console.log(`Update status for order ${id} to ${status}`),
    onReceiveItems: (id) => console.log(`Receive items for order ${id}`),
  },
};

export const Empty: Story = {
  args: {
    orders: [],
    onViewDetails: (id) => console.log(`View details for order ${id}`),
    onUpdateStatus: (id, status) => console.log(`Update status for order ${id} to ${status}`),
    onReceiveItems: (id) => console.log(`Receive items for order ${id}`),
  },
};
