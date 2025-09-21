import type { Meta, StoryObj } from '@storybook/react';
import { SettingsForm } from '../components/SettingsForm';

const meta: Meta<typeof SettingsForm> = {
  title: 'Admin/SettingsForm',
  component: SettingsForm,
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
type Story = StoryObj<typeof SettingsForm>;

export const Default: Story = {
  args: {
    initialData: [
      { id: 1, key: 'tax_rate', value: '0.08', description: 'Current sales tax rate' },
      { id: 2, key: 'currency_symbol', value: '$', description: 'Symbol for currency' },
      { id: 3, key: 'store_name', value: 'RedecellRJ', description: 'Name of the store' },
    ],
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};

export const Empty: Story = {
  args: {
    initialData: [],
    onSubmit: (data) => console.log('Submit:', data),
    onCancel: () => console.log('Cancel'),
  },
};
