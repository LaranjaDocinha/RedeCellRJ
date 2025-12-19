import type { Meta, StoryObj } from '@storybook/react';
import ServiceOrderKanbanBoard from '../components/ServiceOrders/ServiceOrderKanbanBoard';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { fn } from '@storybook/test';

// Mock serviceOrderService
jest.mock('../services/serviceOrderService', () => ({
  fetchAllServiceOrders: jest.fn().mockResolvedValue([
    { id: 1, status: 'Aguardando Avaliação', customer_id: 101, product_description: 'iPhone 13', created_at: new Date().toISOString() },
    { id: 2, status: 'Em Reparo', customer_id: 102, product_description: 'Samsung S22', created_at: new Date().toISOString() },
  ]),
  changeServiceOrderStatus: jest.fn().mockResolvedValue({ success: true }),
}));

const meta: Meta<typeof ServiceOrderKanbanBoard> = {
  title: 'Components/ServiceOrder/ServiceOrderKanbanBoard',
  component: ServiceOrderKanbanBoard,
  tags: ['autodocs'],
  args: {
    onEditOrder: fn(),
    onDeleteOrder: fn(),
    onNewOrder: fn(),
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <NotificationProvider>
          <Story />
        </NotificationProvider>
      </AuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ServiceOrderKanbanBoard>;

export const Default: Story = {};
