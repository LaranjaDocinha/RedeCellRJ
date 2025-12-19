import type { Meta, StoryObj } from '@storybook/react';
import SalesGoalsWidget from '../components/Dashboard/SalesGoalsWidget';
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
  currentSales: 35000,
  goal: 50000,
};

const meta: Meta<typeof SalesGoalsWidget> = {
  title: 'Dashboard/Widgets/SalesGoalsWidget',
  component: SalesGoalsWidget,
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
type Story = StoryObj<typeof SalesGoalsWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
