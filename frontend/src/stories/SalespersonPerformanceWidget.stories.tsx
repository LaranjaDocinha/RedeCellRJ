import type { Meta, StoryObj } from '@storybook/react';
import SalespersonPerformanceWidget from '../components/Dashboard/SalespersonPerformanceWidget';
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
  { salesperson: 'João', totalSales: 25000 },
  { salesperson: 'Maria', totalSales: 22000 },
  { salesperson: 'Carlos', totalSales: 18000 },
  { salesperson: 'Ana', totalSales: 15000 },
];

const meta: Meta<typeof SalespersonPerformanceWidget> = {
  title: 'Dashboard/Widgets/SalespersonPerformanceWidget',
  component: SalespersonPerformanceWidget,
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
type Story = StoryObj<typeof SalespersonPerformanceWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
