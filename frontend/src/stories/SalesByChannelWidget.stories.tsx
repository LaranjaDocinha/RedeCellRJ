import type { Meta, StoryObj } from '@storybook/react';
import SalesByChannelWidget from '../components/Dashboard/SalesByChannelWidget';
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
  { channel: 'Loja Física', totalSales: 25000 },
  { channel: 'Online', totalSales: 15000 },
  { channel: 'WhatsApp', totalSales: 8000 },
  { channel: 'Marketplace', totalSales: 5000 },
];

const meta: Meta<typeof SalesByChannelWidget> = {
  title: 'Dashboard/Widgets/SalesByChannelWidget',
  component: SalesByChannelWidget,
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
type Story = StoryObj<typeof SalesByChannelWidget>;

export const Default: Story = {
  args: {
    selectedPeriod: 'month',
  },
};
