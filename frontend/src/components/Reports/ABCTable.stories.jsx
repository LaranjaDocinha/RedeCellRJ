import React from 'react';
import AdvancedTable from '@components/Common/AdvancedTable'; // Import the existing AdvancedTable
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/ABCTable',
  component: AdvancedTable, // We are showcasing AdvancedTable in this context
  argTypes: {
    columns: { control: 'object' },
    data: { control: 'object' },
    title: { control: 'text' },
    // Add other AdvancedTable props as needed
  },
  parameters: {
    layout: 'fullscreen', // Use fullscreen layout for tables
  },
};

const Template = (args) => <AdvancedTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'Detalhes da Análise ABC',
  columns: [
    {
      Header: 'ID do Produto',
      accessor: 'product_id',
    },
    {
      Header: 'Nome do Produto',
      accessor: 'product_name',
    },
    {
      Header: 'Faturamento Total',
      accessor: 'total_revenue',
      Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: 'Faturamento Acumulado',
      accessor: 'cumulative_revenue',
      Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: 'Percentual Acumulado (%)',
      accessor: 'cumulative_percentage',
      Cell: ({ value }) => `${parseFloat(value).toFixed(2)}%`,
    },
    {
      Header: 'Classe ABC',
      accessor: 'category',
    },
  ],
  data: [
    {
      product_id: 'PROD001',
      product_name: 'Produto A',
      total_revenue: 50000,
      cumulative_revenue: 50000,
      cumulative_percentage: 50.00,
      category: 'A',
    },
    {
      product_id: 'PROD002',
      product_name: 'Produto B',
      total_revenue: 30000,
      cumulative_revenue: 80000,
      cumulative_percentage: 80.00,
      category: 'A',
    },
    {
      product_id: 'PROD003',
      product_name: 'Produto C',
      total_revenue: 10000,
      cumulative_revenue: 90000,
      cumulative_percentage: 90.00,
      category: 'B',
    },
    {
      product_id: 'PROD004',
      product_name: 'Produto D',
      total_revenue: 5000,
      cumulative_revenue: 95000,
      cumulative_percentage: 95.00,
      category: 'B',
    },
    {
      product_id: 'PROD005',
      product_name: 'Produto E',
      total_revenue: 3000,
      cumulative_revenue: 98000,
      cumulative_percentage: 98.00,
      category: 'C',
    },
    {
      product_id: 'PROD006',
      product_name: 'Produto F',
      total_revenue: 2000,
      cumulative_revenue: 100000,
      cumulative_percentage: 100.00,
      category: 'C',
    },
  ],
  enablePagination: true,
  enableSearch: true,
  searchPlaceholder: 'Buscar produto...',
};