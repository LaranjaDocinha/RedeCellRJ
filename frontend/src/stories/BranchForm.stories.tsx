import type { Meta, StoryObj } from '@storybook/react';
import { BranchForm } from '../components/BranchForm';

const meta: Meta<typeof BranchForm> = {
  title: 'Admin/BranchForm',
  component: BranchForm,
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
type Story = StoryObj<typeof BranchForm>;

export const CreateNewBranch: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingBranch: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'Main Store',
      address: '123 Main St',
      phone: '111-222-3333',
      email: 'main@example.com',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
