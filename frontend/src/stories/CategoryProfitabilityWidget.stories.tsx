import type { Meta, StoryObj } from '@storybook/react';
import CategoryProfitabilityWidget from '../components/Dashboard/CategoryProfitabilityWidget';
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
  { category: 'Smartphones', profitability: 45000 },
  { category: 'Acessórios', profitability: 12000 },
  { category: 'Tablets', profitability: 25000 },
  { category: 'Serviços', profitability: 8000 },
];

const meta: Meta<typeof CategoryProfitabilityWidget> = {
  title: 'Dashboard/Widgets/CategoryProfitabilityWidget',
  component: CategoryProfitabilityWidget,
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
type Story = StoryObj<typeof CategoryProfitabilityWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
