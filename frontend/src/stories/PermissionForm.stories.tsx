import type { Meta, StoryObj } from '@storybook/react';
import { PermissionForm } from '../components/PermissionForm';

const meta: Meta<typeof PermissionForm> = {
  title: 'Admin/PermissionForm',
  component: PermissionForm,
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
type Story = StoryObj<typeof PermissionForm>;

export const CreateNewPermission: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingPermission: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'read:Product',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
