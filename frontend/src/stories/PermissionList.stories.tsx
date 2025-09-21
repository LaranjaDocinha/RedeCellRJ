import type { Meta, StoryObj } from '@storybook/react';
import { PermissionList } from '../components/PermissionList';

const meta: Meta<typeof PermissionList> = {
  title: 'Admin/PermissionList',
  component: PermissionList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    permissions: {
      control: 'object',
      description: 'Array of permission objects',
    },
    onEdit: {
      action: 'edit permission',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete permission',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PermissionList>;

export const Default: Story = {
  args: {
    permissions: [
      { id: 1, name: 'read:Product' },
      { id: 2, name: 'create:Product' },
      { id: 3, name: 'update:Product' },
      { id: 4, name: 'delete:Product' },
      { id: 5, name: 'manage:Roles' },
      { id: 6, name: 'manage:Permissions' },
    ],
    onEdit: (id) => console.log(`Edit permission ${id}`),
    onDelete: (id) => console.log(`Delete permission ${id}`),
  },
};

export const Empty: Story = {
  args: {
    permissions: [],
    onEdit: (id) => console.log(`Edit permission ${id}`),
    onDelete: (id) => console.log(`Delete permission ${id}`),
  },
};
