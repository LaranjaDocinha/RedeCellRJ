import type { Meta, StoryObj } from '@storybook/react';
import { UserList } from '../components/UserList';
import { fn } from '@storybook/test';

const mockUsers = [
  { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'Admin' },
  { id: 2, name: 'Maria Souza', email: 'maria@example.com', role: 'Sales' },
  { id: 3, name: 'Pedro Santos', email: 'pedro@example.com', role: 'Technician' },
];

const meta: Meta<typeof UserList> = {
  title: 'Components/Lists/UserList',
  component: UserList,
  tags: ['autodocs'],
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof UserList>;

export const Default: Story = {
  args: {
    users: mockUsers,
  },
};

export const Empty: Story = {
  args: {
    users: [],
  },
};
