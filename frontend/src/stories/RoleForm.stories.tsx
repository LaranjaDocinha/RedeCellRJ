import type { Meta, StoryObj } from '@storybook/react';
import { RoleForm } from '../components/RoleForm';

const meta: Meta<typeof RoleForm> = {
  title: 'Admin/RoleForm',
  component: RoleForm,
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
  },
};

export default meta;
type Story = StoryObj<typeof RoleForm>;

export const CreateNewRole: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingRole: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'admin',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
