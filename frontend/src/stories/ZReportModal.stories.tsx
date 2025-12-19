import type { Meta, StoryObj } from '@storybook/react';
import ZReportModal from '../components/POS/ZReportModal';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockReportData = {
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  totalSalesAmount: 5000.00,
  totalTransactions: 50,
  totalDiscounts: 200.00,
  totalReturns: 100.00,
  cashIn: 5500.00,
  cashOut: 500.00,
  netCash: 5000.00,
  salesByPaymentMethod: [{ method: 'Credit Card', amount: 3000 }, { method: 'Cash', amount: 2000 }],
  salesByCategory: [{ category: 'Electronics', amount: 4000 }, { category: 'Accessories', amount: 1000 }],
};

const meta: Meta<typeof ZReportModal> = {
  title: 'POS/Modals/ZReportModal',
  component: ZReportModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      mockedAxios.get.mockResolvedValue({ data: mockReportData });
      return (
        <NotificationProvider>
          <Story />
        </NotificationProvider>
      );
    },
  ],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ZReportModal>;

export const Open: Story = {
  args: {
    open: true,
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
