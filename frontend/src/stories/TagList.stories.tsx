import type { Meta, StoryObj } from '@storybook/react';
import { TagList } from '../components/TagList';

const meta: Meta<typeof TagList> = {
  title: 'Product/TagList',
  component: TagList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tags: {
      control: 'object',
      description: 'Array of tag objects',
    },
    onEdit: {
      action: 'edit tag',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete tag',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TagList>;

export const Default: Story = {
  args: {
    tags: [
      { id: 1, name: '5G' },
      { id: 2, name: 'Dual SIM' },
      { id: 3, name: 'Fast Charging' },
    ],
    onEdit: (id) => console.log(`Edit tag ${id}`),
    onDelete: (id) => console.log(`Delete tag ${id}`),
  },
};

export const Empty: Story = {
  args: {
    tags: [],
    onEdit: (id) => console.log(`Edit tag ${id}`),
    onDelete: (id) => console.log(`Delete tag ${id}`),
  },
};
