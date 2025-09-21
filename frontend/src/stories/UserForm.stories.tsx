import type { Meta, StoryObj } from '@storybook/react';
import { UserForm } from '../components/UserForm';

const meta: Meta<typeof UserForm> = {
  title: 'Admin/UserForm',
  component: UserForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialData: {
      control: 'object',
      description: 'Initial data for the form (for editing)',
    },
    onSubmit: {
      action: 'submit form',
      description: 'Callback when form is submitted',
    },
    onCancel: {
      action: 'cancel form',
      description: 'Callback when form is cancelled',
    },
    availableRoles: {
      control: 'array',
      description: 'Array of available roles for selection',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserForm>;

export const CreateNewUser: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
    availableRoles: ['admin', 'user', 'manager'],
  },
};

export const EditExistingUser: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
    availableRoles: ['admin', 'user', 'manager'],
  },
};
