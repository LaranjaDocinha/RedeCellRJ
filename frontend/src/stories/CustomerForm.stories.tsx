import type { Meta, StoryObj } from '@storybook/react';
import { CustomerForm } from '../components/CustomerForm';

const meta: Meta<typeof CustomerForm> = {
  title: 'Customer/CustomerForm',
  component: CustomerForm,
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
type Story = StoryObj<typeof CustomerForm>;

export const CreateNewCustomer: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingCustomer: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '11987654321',
      address: 'Rua A, 123',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
