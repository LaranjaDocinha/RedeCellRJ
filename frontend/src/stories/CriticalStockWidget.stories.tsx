import type { Meta, StoryObj } from '@storybook/react';
import CriticalStockWidget from '../components/Dashboard/CriticalStockWidget';
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
  { id: 1, name: 'Cabo USB-C', currentStock: 2, criticalLimit: 5 },
  { id: 2, name: 'Película iPhone 14', currentStock: 0, criticalLimit: 10 },
  { id: 3, name: 'Carregador Samsung', currentStock: 3, criticalLimit: 5 },
];

const meta: Meta<typeof CriticalStockWidget> = {
  title: 'Dashboard/Widgets/CriticalStockWidget',
  component: CriticalStockWidget,
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
type Story = StoryObj<typeof CriticalStockWidget>;

export const Default: Story = {
  args: {},
};
