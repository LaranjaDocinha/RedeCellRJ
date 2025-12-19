import type { Meta, StoryObj } from '@storybook/react';
import SalesForecastWidget from '../components/Dashboard/SalesForecastWidget';
import AnimatedCounter from '../components/AnimatedCounter';

const meta: Meta<typeof SalesForecastWidget> = {
  title: 'Dashboard/Widgets/SalesForecastWidget',
  component: SalesForecastWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SalesForecastWidget>;

export const Default: Story = {
  args: {
    data: {
      current_sales: 15000,
      projected_sales: 45000,
    },
  },
};

export const HighProgress: Story = {
  args: {
    data: {
      current_sales: 42000,
      projected_sales: 45000,
    },
  },
};
