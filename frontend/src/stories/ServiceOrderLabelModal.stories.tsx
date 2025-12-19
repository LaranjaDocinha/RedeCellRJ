import type { Meta, StoryObj } from '@storybook/react';
import ServiceOrderLabelModal from '../components/ServiceOrder/ServiceOrderLabelModal';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

// Mock printer utils
jest.mock('../utils/printer', () => ({
    connectToPrinter: jest.fn().mockResolvedValue({
        transferOut: jest.fn().mockResolvedValue(undefined)
    }),
}));

const mockOrder = {
    id: 123,
    customer_id: 'CUST-001',
    product_description: 'iPhone 13',
    imei: '123456789012345',
    issue_description: 'Tela Quebrada',
    created_at: new Date().toISOString(),
};

const meta: Meta<typeof ServiceOrderLabelModal> = {
  title: 'ServiceOrder/Modals/ServiceOrderLabelModal',
  component: ServiceOrderLabelModal,
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
type Story = StoryObj<typeof ServiceOrderLabelModal>;

export const Open: Story = {
  args: {
    open: true,
    serviceOrder: mockOrder,
  },
};
