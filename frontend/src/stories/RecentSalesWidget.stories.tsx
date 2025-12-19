import type { Meta, StoryObj } from '@storybook/react';
import RecentSalesWidget from '../components/Dashboard/RecentSalesWidget';
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

const meta: Meta<typeof RecentSalesWidget> = {
  title: 'Dashboard/Widgets/RecentSalesWidget',
  component: RecentSalesWidget,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <Story />
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RecentSalesWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'today',
  },
};

export const Weekly: Story = {
  args: {
    selectedPeriod: 'week',
  },
};

export const Monthly: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
