import type { Meta, StoryObj } from '@storybook/react';
import TopSellingProductsChartWidget from '../components/Dashboard/TopSellingProductsChartWidget';

const meta: Meta<typeof TopSellingProductsChartWidget> = {
  title: 'Dashboard/Widgets/TopSellingProductsChartWidget',
  component: TopSellingProductsChartWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopSellingProductsChartWidget>;

export const Default: Story = {
  args: {
    topSellingProducts: [
      { product_name: 'iPhone 13', variation_color: 'Midnight', total_quantity_sold: 45 },
      { product_name: 'Samsung S22', variation_color: 'Black', total_quantity_sold: 38 },
      { product_name: 'AirPods Pro', variation_color: 'White', total_quantity_sold: 32 },
      { product_name: 'MacBook Air', variation_color: 'Space Gray', total_quantity_sold: 28 },
      { product_name: 'iPad Air', variation_color: 'Blue', total_quantity_sold: 21 },
    ],
  },
};

export const Empty: Story = {
  args: {
    topSellingProducts: [],
  },
};
