import type { Meta, StoryObj } from '@storybook/react';
import MostActiveCustomersWidget from '../components/Dashboard/MostActiveCustomersWidget';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const mockData = [
  { id: 1, name: 'João da Silva', totalPurchases: 5400.00, purchaseCount: 12 },
  { id: 2, name: 'Maria Souza', totalPurchases: 3200.50, purchaseCount: 8 },
  { id: 3, name: 'Pedro Santos', totalPurchases: 1500.00, purchaseCount: 5 },
];

const meta: Meta<typeof MostActiveCustomersWidget> = {
  title: 'Dashboard/Widgets/MostActiveCustomersWidget',
  component: MostActiveCustomersWidget,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as any;

      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationProvider>
              <Story />
            </NotificationProvider>
          </AuthProvider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof MostActiveCustomersWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
