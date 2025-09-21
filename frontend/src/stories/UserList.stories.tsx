import type { Meta, StoryObj } from '@storybook/react';
import { UserList } from '../components/UserList';

const meta: Meta<typeof UserList> = {
  title: 'Admin/UserList',
  component: UserList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    users: {
      control: 'object',
      description: 'Array of user objects',
    },
    onEdit: {
      action: 'edit user',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete user',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserList>;

export const Default: Story = {
  args: {
    users: [
      { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' },
      { id: 3, name: 'Manager User', email: 'manager@example.com', role: 'manager' },
    ],
    onEdit: (id) => console.log(`Edit user ${id}`),
    onDelete: (id) => console.log(`Delete user ${id}`),
  },
};

export const Empty: Story = {
  args: {
    users: [],
    onEdit: (id) => console.log(`Edit user ${id}`),
    onDelete: (id) => console.log(`Delete user ${id}`),
  },
};
