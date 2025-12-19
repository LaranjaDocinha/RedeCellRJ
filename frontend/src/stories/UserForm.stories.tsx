import type { Meta, StoryObj } from '@storybook/react';
import { UserForm } from '../components/UserForm';
import { fn } from '@storybook/test';

const meta: Meta<typeof UserForm> = {
  title: 'Components/Forms/UserForm',
  component: UserForm,
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
    onCancel: fn(),
    availableRoles: ['admin', 'manager', 'salesperson', 'technician'],
  },
};

export default meta;
type Story = StoryObj<typeof UserForm>;

export const NewUser: Story = {
  args: {},
};

export const EditUser: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      role: 'manager',
    },
  },
};
