import type { Meta, StoryObj } from '@storybook/react';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';

const meta: Meta<typeof PaymentMethodSelector> = {
  title: 'Sales/PaymentMethodSelector',
  component: PaymentMethodSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: {
      action: 'payment method selected',
      description: 'Callback when a payment method is selected',
    },
    selectedMethod: {
      control: 'text',
      description: 'Currently selected payment method',
    },
    availableMethods: {
      control: 'object',
      description: 'Array of available payment methods',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PaymentMethodSelector>;

export const Default: Story = {
  args: {
    onSelect: (method) => console.log('Selected:', method),
    selectedMethod: 'credit_card',
    availableMethods: ['credit_card', 'pix', 'cash'],
  },
};

export const NoSelection: Story = {
  args: {
    onSelect: (method) => console.log('Selected:', method),
    selectedMethod: '',
    availableMethods: ['credit_card', 'pix', 'cash'],
  },
};
