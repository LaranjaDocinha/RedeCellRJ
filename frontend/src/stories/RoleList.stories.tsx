import type { Meta, StoryObj } from '@storybook/react';
import { RoleList } from '../components/RoleList';

const meta: Meta<typeof RoleList> = {
  title: 'Admin/RoleList',
  component: RoleList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    roles: {
      control: 'object',
      description: 'Array of role objects',
    },
    onEdit: {
      action: 'edit role',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete role',
      description: 'Callback when delete button is clicked',
    },
    onManagePermissions: {
      action: 'manage permissions',
      description: 'Callback when manage permissions button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoleList>;

export const Default: Story = {
  args: {
    roles: [
      { id: 1, name: 'admin' },
      { id: 2, name: 'user' },
      { id: 3, name: 'manager' },
    ],
    onEdit: (id) => console.log(`Edit role ${id}`),
    onDelete: (id) => console.log(`Delete role ${id}`),
    onManagePermissions: (id) => console.log(`Manage permissions for role ${id}`),
  },
};

export const Empty: Story = {
  args: {
    roles: [],
    onEdit: (id) => console.log(`Edit role ${id}`),
    onDelete: (id) => console.log(`Delete role ${id}`),
    onManagePermissions: (id) => console.log(`Manage permissions for role ${id}`),
  },
};
