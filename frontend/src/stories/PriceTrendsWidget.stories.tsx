import type { Meta, StoryObj } from '@storybook/react';
import PriceTrendsWidget from '../components/Dashboard/PriceTrendsWidget';
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
  { date: '2023-10-01', price: 150.00 },
  { date: '2023-10-02', price: 155.00 },
  { date: '2023-10-03', price: 152.00 },
  { date: '2023-10-04', price: 160.00 },
];

const meta: Meta<typeof PriceTrendsWidget> = {
  title: 'Dashboard/Widgets/PriceTrendsWidget',
  component: PriceTrendsWidget,
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
type Story = StoryObj<typeof PriceTrendsWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'week',
  },
};
