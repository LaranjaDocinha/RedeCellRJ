import type { Meta, StoryObj } from '@storybook/react';
import { CategoryList } from '../components/CategoryList';

const meta: Meta<typeof CategoryList> = {
  title: 'Product/CategoryList',
  component: CategoryList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    categories: {
      control: 'object',
      description: 'Array of category objects',
    },
    onEdit: {
      action: 'edit category',
      description: 'Callback when edit button is clicked',
    },
    onDelete: {
      action: 'delete category',
      description: 'Callback when delete button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CategoryList>;

export const Default: Story = {
  args: {
    categories: [
      { id: 1, name: 'Smartphones', description: 'Latest mobile phones' },
      { id: 2, name: 'Tablets', description: 'Portable computing devices' },
      { id: 3, name: 'Accessories', description: 'Phone and tablet accessories' },
    ],
    onEdit: (id) => console.log(`Edit category ${id}`),
    onDelete: (id) => console.log(`Delete category ${id}`),
  },
};

export const Empty: Story = {
  args: {
    categories: [],
    onEdit: (id) => console.log(`Edit category ${id}`),
    onDelete: (id) => console.log(`Delete category ${id}`),
  },
};
