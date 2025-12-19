import type { Meta, StoryObj } from '@storybook/react';
import KanbanColumn from '../components/Kanban/KanbanColumn';
import { fn } from '@storybook/test';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

const mockColumn = {
  id: 'todo',
  title: 'To Do',
  cards: [
    { id: '1', title: 'Task 1', description: 'Description 1' },
    { id: '2', title: 'Task 2', description: 'Description 2' },
  ],
};

const meta: Meta<typeof KanbanColumn> = {
  title: 'Components/Kanban/KanbanColumn',
  component: KanbanColumn,
  tags: ['autodocs'],
  args: {
    onCreateCard: fn(),
    onDeleteCard: fn(),
    onEditCard: fn(),
    triggerHapticFeedback: fn(),
  },
  decorators: [
    (Story) => (
      <DndContext>
        <SortableContext items={['todo']}>
            <Story />
        </SortableContext>
      </DndContext>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanbanColumn>;

export const Default: Story = {
  args: {
    column: mockColumn,
  },
};
