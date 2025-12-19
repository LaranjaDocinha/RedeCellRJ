import type { Meta, StoryObj } from '@storybook/react';
import PostSaleActionsModal from '../components/POS/PostSaleActionsModal';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

// Mock printer utils
jest.mock('../utils/printer', () => ({
    connectToPrinter: jest.fn().mockResolvedValue({}),
    printReceipt: jest.fn().mockResolvedValue({}),
}));

const meta: Meta<typeof PostSaleActionsModal> = {
  title: 'POS/Modals/PostSaleActionsModal',
  component: PostSaleActionsModal,
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
  },
};

export default meta;
type Story = StoryObj<typeof PostSaleActionsModal>;

export const Open: Story = {
  args: {
    open: true,
    saleId: '12345',
    customerEmail: 'cliente@exemplo.com',
    customerPhone: '5521999999999',
  },
};

export const Closed: Story = {
  args: {
    open: false,
    saleId: null,
  },
};
