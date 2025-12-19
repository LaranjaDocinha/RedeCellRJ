import type { Meta, StoryObj } from '@storybook/react';
import SalesByMonthChartWidget from '../components/Dashboard/SalesByMonthChartWidget';

const meta: Meta<typeof SalesByMonthChartWidget> = {
  title: 'Dashboard/Widgets/SalesByMonthChartWidget',
  component: SalesByMonthChartWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SalesByMonthChartWidget>;

export const Default: Story = {
  args: {
    salesByMonth: [
      { month: 'Jan', monthly_sales: 12000 },
      { month: 'Feb', monthly_sales: 19000 },
      { month: 'Mar', monthly_sales: 15000 },
      { month: 'Apr', monthly_sales: 22000 },
      { month: 'May', monthly_sales: 18000 },
      { month: 'Jun', monthly_sales: 25000 },
    ],
  },
};

export const Empty: Story = {
  args: {
    salesByMonth: [],
  },
};
