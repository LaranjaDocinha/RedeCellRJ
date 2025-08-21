import React from 'react';
import ABCChart from '@components/Reports/ABCChart';
import { ThemeProvider } from '@context/ThemeContext'; // Assuming you have a ThemeProvider
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/ABCChart',
  component: ABCChart,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    data: { control: 'object' },
    title: { control: 'text' },
    animationDelay: { control: 'number' },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template = (args) => <ABCChart {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Análise ABC de Produtos',
  data: [
    { product_name: 'Produto A', total_revenue: 50000, cumulative_percentage: 50.00 },
    { product_name: 'Produto B', total_revenue: 30000, cumulative_percentage: 80.00 },
    { product_name: 'Produto C', total_revenue: 10000, cumulative_percentage: 90.00 },
    { product_name: 'Produto D', total_revenue: 5000, cumulative_percentage: 95.00 },
    { product_name: 'Produto E', total_revenue: 3000, cumulative_percentage: 98.00 },
    { product_name: 'Produto F', total_revenue: 2000, cumulative_percentage: 100.00 },
  ],
  animationDelay: 0,
};

export const MoreProducts = Template.bind({});
MoreProducts.args = {
  title: 'Análise ABC Detalhada',
  data: [
    { product_name: 'Item 1', total_revenue: 25000, cumulative_percentage: 25.00 },
    { product_name: 'Item 2', total_revenue: 20000, cumulative_percentage: 45.00 },
    { product_name: 'Item 3', total_revenue: 15000, cumulative_percentage: 60.00 },
    { product_name: 'Item 4', total_revenue: 10000, cumulative_percentage: 70.00 },
    { product_name: 'Item 5', total_revenue: 8000, cumulative_percentage: 78.00 },
    { product_name: 'Item 6', total_revenue: 7000, cumulative_percentage: 85.00 },
    { product_name: 'Item 7', total_revenue: 6000, cumulative_percentage: 91.00 },
    { product_name: 'Item 8', total_revenue: 4000, cumulative_percentage: 95.00 },
    { product_name: 'Item 9', total_revenue: 3000, cumulative_percentage: 98.00 },
    { product_name: 'Item 10', total_revenue: 2000, cumulative_percentage: 100.00 },
  ],
  animationDelay: 0.1,
};