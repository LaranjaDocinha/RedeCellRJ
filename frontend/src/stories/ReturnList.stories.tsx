import type { Meta, StoryObj } from '@storybook/react';
import { ReturnList } from '../components/ReturnList';

const meta: Meta<typeof ReturnList> = {
  title: 'Sales/ReturnList',
  component: ReturnList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    returns: {
      control: 'object',
      description: 'Array of return objects',
    },
    onViewDetails: {
      action: 'view details',
      description: 'Callback when view details button is clicked',
    },
    onUpdateStatus: {
      action: 'update status',
      description: 'Callback when update status button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReturnList>;

export const Default: Story = {
  args: {
    returns: [
      { id: 1, sale_id: 101, return_date: '2023-01-05T10:00:00Z', reason: 'Defective item', status: 'pending', refund_amount: 50.00 },
      { id: 2, sale_id: 102, return_date: '2023-01-06T11:30:00Z', reason: 'Wrong size', status: 'completed', refund_amount: 25.00 },
      { id: 3, sale_id: 103, return_date: '2023-01-07T14:00:00Z', reason: 'Changed mind', status: 'rejected', refund_amount: 0.00 },
    ],
    onViewDetails: (id) => console.log(`View details for return ${id}`),
    onUpdateStatus: (id, status) => console.log(`Update status for return ${id} to ${status}`),
  },
};

export const Empty: Story = {
  args: {
    returns: [],
    onViewDetails: (id) => console.log(`View details for return ${id}`),
    onUpdateStatus: (id, status) => console.log(`Update status for return ${id} to ${status}`),
  },
};
