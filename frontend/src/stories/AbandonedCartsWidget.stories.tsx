import type { Meta, StoryObj } from '@storybook/react';
import AbandonedCartsWidget from '../components/Dashboard/AbandonedCartsWidget';
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

// Mock fetch response
const mockData = {
  totalAbandonedCarts: 15,
  totalAbandonedAmount: 3450.00,
  recoveryRate: 12.5,
};

const meta: Meta<typeof AbandonedCartsWidget> = {
  title: 'Dashboard/Widgets/AbandonedCartsWidget',
  component: AbandonedCartsWidget,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Simple fetch mock
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
type Story = StoryObj<typeof AbandonedCartsWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'today',
  },
};
