import type { Meta, StoryObj } from '@storybook/react';
import SaleDetailsModal from '../components/POS/SaleDetailsModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from '@storybook/test';
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

const mockSaleDetails = {
  id: '12345',
  total_amount: '4500.00',
  sale_date: new Date().toISOString(),
  user_name: 'Vendedor João',
  customer_name: 'Maria Cliente',
  customer_email: 'maria@example.com',
  customer_phone: '(21) 99999-9999',
  items: [
    { product_name: 'iPhone 13', sku: 'IPH13', quantity: 1, unit_price: '4500.00', total_price: '4500.00' },
  ],
  payments: [
    { method: 'Cartão de Crédito', amount: '4500.00' },
  ],
};

const meta: Meta<typeof SaleDetailsModal> = {
  title: 'POS/Modals/SaleDetailsModal',
  component: SaleDetailsModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      mockedAxios.get.mockResolvedValue({ data: mockSaleDetails });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SaleDetailsModal>;

export const Open: Story = {
  args: {
    open: true,
    saleId: '12345',
  },
};

export const Closed: Story = {
  args: {
    open: false,
    saleId: null,
  },
};
