import type { Meta, StoryObj } from '@storybook/react';
import { CategoryForm } from '../components/CategoryForm';

const meta: Meta<typeof CategoryForm> = {
  title: 'Product/CategoryForm',
  component: CategoryForm,
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
type Story = StoryObj<typeof CategoryForm>;

export const CreateNewCategory: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingCategory: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'Smartphones',
      description: 'Latest mobile phones',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
