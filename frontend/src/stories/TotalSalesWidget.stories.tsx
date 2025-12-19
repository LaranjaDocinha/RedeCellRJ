import type { Meta, StoryObj } from '@storybook/react';
import TotalSalesWidget from '../components/Dashboard/TotalSalesWidget';

const meta: Meta<typeof TotalSalesWidget> = {
  title: 'Dashboard/Widgets/TotalSalesWidget',
  component: TotalSalesWidget,
  tags: ['autodocs'],
  argTypes: {
    totalSales: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof TotalSalesWidget>;

export const Default: Story = {
  args: {
    totalSales: 15430.50,
  },
};

export const ZeroSales: Story = {
  args: {
    totalSales: 0,
  },
};

export const HighValue: Story = {
  args: {
    totalSales: 1500000.00,
  },
};
