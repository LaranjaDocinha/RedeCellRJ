import type { Meta, StoryObj } from '@storybook/react';
import { SupplierList } from '../components/SupplierList';

const meta: Meta<typeof SupplierList> = {
  title: 'Supplier/SupplierList',
  component: SupplierList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    suppliers: {
      control: 'object',
      description: 'Array of supplier objects',
    },
    onEdit: {
      action: 'edit supplier',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete supplier',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SupplierList>;

export const Default: Story = {
  args: {
    suppliers: [
      { id: 1, name: 'Samsung Corp', contact_person: 'John Doe', email: 'john.doe@samsung.com', phone: '1112345678', address: '123 Samsung St' },
      { id: 2, name: 'Apple Inc.', contact_person: 'Jane Smith', email: 'jane.smith@apple.com', phone: '2223456789', address: '456 Apple Ave' },
      { id: 3, name: 'Xiaomi Global', contact_person: 'Peter Jones', email: 'peter.jones@xiaomi.com', phone: '3334567890', address: '789 Xiaomi Rd' },
    ],
    onEdit: (id) => console.log(`Edit supplier ${id}`),
    onDelete: (id) => console.log(`Delete supplier ${id}`),
  },
};

export const Empty: Story = {
  args: {
    suppliers: [],
    onEdit: (id) => console.log(`Edit supplier ${id}`),
    onDelete: (id) => console.log(`Delete supplier ${id}`),
  },
};
