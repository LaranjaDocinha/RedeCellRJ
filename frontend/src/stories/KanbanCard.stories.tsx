import type { Meta, StoryObj } from '@storybook/react';
import KanbanCard from '../components/Kanban/KanbanCard';
import { fn } from '@storybook/test';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { MemoryRouter } from 'react-router-dom';

const mockCard = {
  id: '1',
  title: 'Task 1',
  description: 'Description 1',
  assignee: { name: 'João' },
  due_date: new Date().toISOString(),
};

const meta: Meta<typeof KanbanCard> = {
  title: 'Components/Kanban/KanbanCard',
  component: KanbanCard,
  tags: ['autodocs'],
  args: {
    onDeleteCard: fn(),
    onEditCard: fn(),
    triggerHapticFeedback: fn(),
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <DndContext>
            <SortableContext items={['1']}>
                <Story />
            </SortableContext>
        </DndContext>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanbanCard>;

export const Default: Story = {
  args: {
    card: mockCard,
    columnId: 'todo',
  },
};
