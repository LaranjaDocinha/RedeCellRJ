import type { Meta, StoryObj } from '@storybook/react';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { fn } from '@storybook/test';

// Mock order data matching ServiceOrder type structure roughly
const mockOrder = {
  id: 1,
  customer_name: 'João Silva',
  technician_name: 'Carlos Técnico',
  status: 'pending',
  created_at: new Date().toISOString(),
  product_description: 'iPhone 13 - Tela quebrada',
  issue_description: 'Caiu no chão e trincou o vidro frontal.',
  budget_value: 450.00,
  items: [
    { id: 101, service_description: 'Troca de Tela', quantity: 1, unit_price: 450.00 },
  ],
};

const meta: Meta<typeof OrderDetailsModal> = {
  title: 'Components/Modals/OrderDetailsModal',
  component: OrderDetailsModal,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof OrderDetailsModal>;

export const Open: Story = {
  args: {
    order: mockOrder as any,
  },
};

export const Closed: Story = {
  args: {
    order: null,
  },
};
