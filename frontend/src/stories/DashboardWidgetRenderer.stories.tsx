import type { Meta, StoryObj } from '@storybook/react';
import DashboardWidgetRenderer from '../components/Dashboard/DashboardWidgetRenderer';
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
  totalSales: 15000,
  salesByMonth: [],
  topSellingProducts: [],
  recentSales: [],
  slowMovingProducts: [],
  salesForecast: {},
  averageTicketBySalesperson: [],
  salesHeatmap: [],
};

const mockWidgets = [
  { id: 'totalSales', visible: true, order: 0, component: () => <div>Total Sales Widget</div>, title: 'Total Sales' },
  { id: 'recentSales', visible: true, order: 1, component: () => <div>Recent Sales Widget</div>, title: 'Recent Sales' },
];

const meta: Meta<typeof DashboardWidgetRenderer> = {
  title: 'Dashboard/DashboardWidgetRenderer',
  component: DashboardWidgetRenderer,
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
type Story = StoryObj<typeof DashboardWidgetRenderer>;

export const Default: Story = {
  args: {
    widgets: mockWidgets,
    data: mockData,
    onDragEnd: () => {},
    selectedPeriod: 'today',
    columns: 2,
  },
};

export const Loading: Story = {
  args: {
    widgets: mockWidgets,
    data: null, // Triggers loading state
    onDragEnd: () => {},
    selectedPeriod: 'today',
    columns: 2,
  },
};
