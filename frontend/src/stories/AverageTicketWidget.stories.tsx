import type { Meta, StoryObj } from '@storybook/react';
import AverageTicketWidget from '../components/Dashboard/AverageTicketWidget';

const meta: Meta<typeof AverageTicketWidget> = {
  title: 'Dashboard/Widgets/AverageTicketWidget',
  component: AverageTicketWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AverageTicketWidget>;

export const Default: Story = {
  args: {
    data: [
      { user_name: 'João Silva', total_sales: 45, avg_ticket: 1250.50 },
      { user_name: 'Maria Santos', total_sales: 38, avg_ticket: 1100.00 },
      { user_name: 'Pedro Oliveira', total_sales: 32, avg_ticket: 980.75 },
    ],
  },
};

export const SingleUser: Story = {
  args: {
    data: [
      { user_name: 'João Silva', total_sales: 15, avg_ticket: 2500.00 },
    ],
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
