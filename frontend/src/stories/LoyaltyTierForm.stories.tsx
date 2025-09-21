import type { Meta, StoryObj } from '@storybook/react';
import { LoyaltyTierForm } from '../components/LoyaltyTierForm';

const meta: Meta<typeof LoyaltyTierForm> = {
  title: 'Loyalty/LoyaltyTierForm',
  component: LoyaltyTierForm,
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
type Story = StoryObj<typeof LoyaltyTierForm>;

export const CreateNewLoyaltyTier: Story = {
  args: {
    onSubmit: (data) => console.log('Create:', data),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditExistingLoyaltyTier: Story = {
  args: {
    initialData: {
      id: 1,
      name: 'Bronze',
      min_points: 0,
      description: 'Entry level',
      benefits: { discount: '5%' },
    },
    onSubmit: (data) => console.log('Edit:', data),
    onCancel: () => console.log('Edit cancelled'),
  },
};
