import type { Meta, StoryObj } from '@storybook/react';
import { SupplierForm } from '../components/SupplierForm';

const meta: Meta<typeof SupplierForm> = {
  title: 'Supplier/SupplierForm',
  component: SupplierForm,
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
type Story = StoryObj<typeof SupplierForm>;

export const CreateNewSupplier: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingSupplier: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'Samsung Corp',
      contact_person: 'John Doe',
      email: 'john.doe@samsung.com',
      phone: '1112345678',
      address: '123 Samsung St',
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
