import type { Meta, StoryObj } from '@storybook/react';
import LoyaltyPointsWidget from '../components/Dashboard/LoyaltyPointsWidget';
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
  loyalty_points: 1250,
};

const meta: Meta<typeof LoyaltyPointsWidget> = {
  title: 'Dashboard/Widgets/LoyaltyPointsWidget',
  component: LoyaltyPointsWidget,
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
type Story = StoryObj<typeof LoyaltyPointsWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'today',
  },
};
