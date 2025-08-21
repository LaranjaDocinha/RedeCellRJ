import React from 'react';
import AdvancedTable from '@components/Common/AdvancedTable'; // Import the existing AdvancedTable
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/ProfitabilityTable',
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
  title: 'Detalhes de Lucratividade por Produto',
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
      Header: 'Quantidade Vendida',
      accessor: 'total_quantity_sold',
    },
    {
      Header: 'Receita Total',
      accessor: 'total_revenue',
      Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: 'Custo Total',
      accessor: 'total_cost',
      Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: 'Lucro Bruto',
      accessor: 'gross_profit',
      Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: 'Margem (%)',
      accessor: 'profit_margin_percentage',
      Cell: ({ value }) => `${parseFloat(value).toFixed(2)}%`,
    },
  ],
  data: [
    {
      product_id: 'PROD001',
      product_name: 'Smartphone X',
      total_quantity_sold: 100,
      total_revenue: 50000.00,
      total_cost: 20000.00,
      gross_profit: 30000.00,
      profit_margin_percentage: 60.00,
    },
    {
      product_id: 'PROD002',
      product_name: 'Fone de Ouvido Bluetooth',
      total_quantity_sold: 250,
      total_revenue: 12500.00,
      total_cost: 7500.00,
      gross_profit: 5000.00,
      profit_margin_percentage: 40.00,
    },
    {
      product_id: 'PROD003',
      product_name: 'Capa Protetora',
      total_quantity_sold: 500,
      total_revenue: 5000.00,
      total_cost: 4000.00,
      gross_profit: 1000.00,
      profit_margin_percentage: 20.00,
    },
  ],
  enablePagination: true,
  enableSearch: true,
  searchPlaceholder: 'Buscar produto...',
};