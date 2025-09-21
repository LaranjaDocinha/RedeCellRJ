import type { Meta, StoryObj } from '@storybook/react';
import { CustomerList } from '../components/CustomerList';

const meta: Meta<typeof CustomerList> = {
  title: 'Customer/CustomerList',
  component: CustomerList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    customers: {
      control: 'object',
      description: 'Array of customer objects',
    },
    onEdit: {
      action: 'edit customer',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete customer',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CustomerList>;

export const Default: Story = {
  args: {
    customers: [
      { id: 1, name: 'João Silva', email: 'joao.silva@example.com', phone: '11987654321', address: 'Rua A, 123' },
      { id: 2, name: 'Maria Souza', email: 'maria.souza@example.com', phone: '11912345678', address: 'Av. B, 456' },
      { id: 3, name: 'Pedro Santos', email: 'pedro.santos@example.com', phone: '11998765432', address: 'Travessa C, 789' },
    ],
    onEdit: (id) => console.log(`Edit customer ${id}`),
    onDelete: (id) => console.log(`Delete customer ${id}`),
  },
};

export const Empty: Story = {
  args: {
    customers: [],
    onEdit: (id) => console.log(`Edit customer ${id}`),
    onDelete: (id) => console.log(`Delete customer ${id}`),
  },
};
