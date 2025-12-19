import type { Meta, StoryObj } from '@storybook/react';
import AnnualSalesComparisonWidget from '../components/Dashboard/AnnualSalesComparisonWidget';
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
  { year: '2022', totalSales: 150000 },
  { year: '2023', totalSales: 280000 },
  { year: '2024', totalSales: 350000 },
];

const meta: Meta<typeof AnnualSalesComparisonWidget> = {
  title: 'Dashboard/Widgets/AnnualSalesComparisonWidget',
  component: AnnualSalesComparisonWidget,
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
type Story = StoryObj<typeof AnnualSalesComparisonWidget>;

export const Default: Story = {
  args: {},
};
