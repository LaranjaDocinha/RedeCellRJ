import type { Meta, StoryObj } from '@storybook/react';
import ProductPerformanceWidget from '../components/Dashboard/ProductPerformanceWidget';
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
  { productName: 'iPhone 13', totalSales: 45000, quantitySold: 15 },
  { productName: 'Samsung S22', totalSales: 32000, quantitySold: 12 },
  { productName: 'AirPods', totalSales: 12000, quantitySold: 25 },
];

const meta: Meta<typeof ProductPerformanceWidget> = {
  title: 'Dashboard/Widgets/ProductPerformanceWidget',
  component: ProductPerformanceWidget,
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
type Story = StoryObj<typeof ProductPerformanceWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
