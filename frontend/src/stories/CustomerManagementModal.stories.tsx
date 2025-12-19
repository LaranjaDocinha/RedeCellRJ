import type { Meta, StoryObj } from '@storybook/react';
import CustomerManagementModal from '../components/POS/CustomerManagementModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from '../contexts/NotificationContext';
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

const mockCustomers = [
    { id: '1', name: 'João Silva', email: 'joao@example.com' },
    { id: '2', name: 'Maria Souza', email: 'maria@example.com' },
];

const meta: Meta<typeof CustomerManagementModal> = {
  title: 'POS/Modals/CustomerManagementModal',
  component: CustomerManagementModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Mock search endpoint
      mockedAxios.get.mockResolvedValue({ data: { customers: mockCustomers, totalCustomers: 2 } });
      return (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <Story />
            </NotificationProvider>
        </QueryClientProvider>
      );
    },
  ],
  args: {
    onClose: fn(),
    onCustomerSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CustomerManagementModal>;

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
