import type { Meta, StoryObj } from '@storybook/react';
import { TagForm } from '../components/TagForm';

const meta: Meta<typeof TagForm> = {
  title: 'Product/TagForm',
  component: TagForm,
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
type Story = StoryObj<typeof TagForm>;

export const CreateNewTag: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingTag: Story = {
  args: {
    initialData: {
      id: 1,
      name: '5G',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
