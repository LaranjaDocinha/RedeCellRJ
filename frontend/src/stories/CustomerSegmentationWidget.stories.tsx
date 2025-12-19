import type { Meta, StoryObj } from '@storybook/react';
import CustomerSegmentationWidget from '../components/Dashboard/CustomerSegmentationWidget';
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
  { segment: 'Novos', count: 120 },
  { segment: 'Recorrentes', count: 450 },
  { segment: 'VIP', count: 50 },
  { segment: 'Inativos', count: 80 },
];

const meta: Meta<typeof CustomerSegmentationWidget> = {
  title: 'Dashboard/Widgets/CustomerSegmentationWidget',
  component: CustomerSegmentationWidget,
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
type Story = StoryObj<typeof CustomerSegmentationWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
