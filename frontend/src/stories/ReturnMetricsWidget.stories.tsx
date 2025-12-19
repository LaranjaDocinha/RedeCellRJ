import type { Meta, StoryObj } from '@storybook/react';
import ReturnMetricsWidget from '../components/Dashboard/ReturnMetricsWidget';
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

const mockData = {
  totalReturns: 5,
  totalReturnAmount: 850.00,
  returnRate: 2.5,
};

const meta: Meta<typeof ReturnMetricsWidget> = {
  title: 'Dashboard/Widgets/ReturnMetricsWidget',
  component: ReturnMetricsWidget,
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
type Story = StoryObj<typeof ReturnMetricsWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
