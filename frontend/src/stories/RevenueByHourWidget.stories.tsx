import type { Meta, StoryObj } from '@storybook/react';
import RevenueByHourWidget from '../components/Dashboard/RevenueByHourWidget';
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
  { hour: '08:00', totalRevenue: 500 },
  { hour: '09:00', totalRevenue: 1200 },
  { hour: '10:00', totalRevenue: 2500 },
  { hour: '11:00', totalRevenue: 1800 },
  { hour: '12:00', totalRevenue: 900 },
];

const meta: Meta<typeof RevenueByHourWidget> = {
  title: 'Dashboard/Widgets/RevenueByHourWidget',
  component: RevenueByHourWidget,
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
type Story = StoryObj<typeof RevenueByHourWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'today',
  },
};
