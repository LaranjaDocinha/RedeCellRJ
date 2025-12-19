import type { Meta, StoryObj } from '@storybook/react';
import ShiftDashboard from '../components/POS/ShiftDashboard';
import { NotificationProvider } from '../contexts/NotificationContext';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockReportData = {
  totalSalesAmount: 12500.00,
  totalTransactions: 45,
  salesByPaymentMethod: [
    { method: 'Credit Card', amount: 8000 },
    { method: 'Debit Card', amount: 3000 },
    { method: 'Cash', amount: 1500 },
  ],
  salesByCategory: [
    { category: 'Phones', amount: 9000 },
    { category: 'Accessories', amount: 3500 },
  ],
  averageTransactionValue: 277.77,
};

const meta: Meta<typeof ShiftDashboard> = {
  title: 'POS/Widgets/ShiftDashboard',
  component: ShiftDashboard,
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
};

export default meta;
type Story = StoryObj<typeof ShiftDashboard>;

export const Default: Story = {};
