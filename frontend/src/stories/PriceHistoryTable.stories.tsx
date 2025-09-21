import type { Meta, StoryObj } from '@storybook/react';
import { PriceHistoryTable } from '../components/PriceHistoryTable';

const meta: Meta<typeof PriceHistoryTable> = {
  title: 'Product/PriceHistoryTable',
  component: PriceHistoryTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    history: {
      control: 'object',
      description: 'Array of price history entries',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PriceHistoryTable>;

export const Default: Story = {
  args: {
    history: [
      { id: 1, old_price: 100.00, new_price: 120.00, changed_at: '2023-01-01T10:00:00Z' },
      { id: 2, old_price: 120.00, new_price: 110.00, changed_at: '2023-02-15T11:30:00Z' },
      { id: 3, old_price: 110.00, new_price: 115.00, changed_at: '2023-03-20T14:00:00Z' },
    ],
  },
};

export const Empty: Story = {
  args: {
    history: [],
  },
};
