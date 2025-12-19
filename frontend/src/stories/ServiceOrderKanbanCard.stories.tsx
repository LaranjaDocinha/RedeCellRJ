import type { Meta, StoryObj } from '@storybook/react';
import ServiceOrderKanbanCard from '../components/ServiceOrders/ServiceOrderKanbanCard';
import { fn } from '@storybook/test';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

const mockOrder = {
  id: 1,
  status: 'Aguardando Avaliação',
  customer_id: 101,
  product_description: 'iPhone 13',
  issue_description: 'Tela Quebrada',
  created_at: new Date().toISOString(),
};

const meta: Meta<typeof ServiceOrderKanbanCard> = {
  title: 'Components/ServiceOrder/ServiceOrderKanbanCard',
  component: ServiceOrderKanbanCard,
  tags: ['autodocs'],
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <DndContext>
        <SortableContext items={['1']}>
            <Story />
        </SortableContext>
      </DndContext>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ServiceOrderKanbanCard>;

export const Default: Story = {
  args: {
    id: '1',
    serviceOrder: mockOrder as any,
  },
};
