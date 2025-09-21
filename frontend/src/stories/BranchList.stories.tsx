import type { Meta, StoryObj } from '@storybook/react';
import { BranchList } from '../components/BranchList';

const meta: Meta<typeof BranchList> = {
  title: 'Admin/BranchList',
  component: BranchList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    branches: {
      control: 'object',
      description: 'Array of branch objects',
    },
    onEdit: {
      action: 'edit branch',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete branch',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BranchList>;

export const Default: Story = {
  args: {
    branches: [
      { id: 1, name: 'Main Store', address: '123 Main St', phone: '111-222-3333', email: 'main@example.com' },
      { id: 2, name: 'Downtown Branch', address: '456 Downtown Ave', phone: '444-555-6666', email: 'downtown@example.com' },
    ],
    onEdit: (id) => console.log(`Edit branch ${id}`),
    onDelete: (id) => console.log(`Delete branch ${id}`),
  },
};

export const Empty: Story = {
  args: {
    branches: [],
    onEdit: (id) => console.log(`Edit branch ${id}`),
    onDelete: (id) => console.log(`Delete branch ${id}`),
  },
};
