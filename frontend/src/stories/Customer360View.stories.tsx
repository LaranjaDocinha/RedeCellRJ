import type { Meta, StoryObj } from '@storybook/react';
import Customer360View from '../components/POS/Customer360View';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const mockCustomerData = {
  id: '1',
  name: 'Maria Silva',
  email: 'maria@example.com',
  phone: '(21) 99999-8888',
  address: 'Rua das Flores, 123',
  cpf: '123.456.789-00',
  store_credit_balance: 150.50,
  loyalty_points: 500,
  recent_sales: [
    { id: '101', total_amount: '4500.00', sale_date: new Date().toISOString() },
    { id: '102', total_amount: '120.00', sale_date: new Date(Date.now() - 86400000).toISOString() },
  ],
};

const meta: Meta<typeof Customer360View> = {
  title: 'POS/Customer360View',
  component: Customer360View,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      mockedAxios.get.mockResolvedValue({ data: mockCustomerData });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Customer360View>;

export const Default: Story = {
  args: {
    customerId: '1',
  },
};
