import type { Meta, StoryObj } from '@storybook/react';
import SplitPaymentModal from '../components/POS/SplitPaymentModal';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

const meta: Meta<typeof SplitPaymentModal> = {
  title: 'POS/Modals/SplitPaymentModal',
  component: SplitPaymentModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NotificationProvider>
        <Story />
      </NotificationProvider>
    ),
  ],
  args: {
    onClose: fn(),
    onConfirm: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SplitPaymentModal>;

export const Open: Story = {
  args: {
    open: true,
    totalAmount: 150.00,
    availablePaymentMethods: ['credit_card', 'debit_card', 'cash', 'pix'],
  },
};

export const WithCustomerCredit: Story = {
  args: {
    open: true,
    totalAmount: 200.00,
    availablePaymentMethods: ['credit_card', 'debit_card', 'cash', 'pix', 'store_credit'],
    customer360Data: {
        id: '1',
        name: 'João',
        email: 'joao@test.com',
        store_credit_balance: 50.00,
        loyalty_points: 0,
        recent_sales: []
    },
  },
};
