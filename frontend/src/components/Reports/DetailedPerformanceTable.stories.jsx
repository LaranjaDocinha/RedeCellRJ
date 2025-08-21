import React from 'react';
import AdvancedTable from '@components/Common/AdvancedTable'; // Import the existing AdvancedTable
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Reports/DetailedPerformanceTable',
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
  title: 'Detalhes de Reparos por Técnico',
  columns: [
    {
      Header: 'ID do Reparo',
      accessor: 'repair_id',
    },
    {
      Header: 'Cliente',
      accessor: 'customer_name',
    },
    {
      Header: 'Descrição',
      accessor: 'description',
    },
    {
      Header: 'Status',
      accessor: 'status',
    },
    {
      Header: 'Custo Final',
      accessor: 'final_cost',
      Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: 'Data de Criação',
      accessor: 'created_at',
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: 'Data de Conclusão',
      accessor: 'actual_completion_date',
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
  ],
  data: [
    {
      repair_id: 'REP001',
      customer_name: 'João Silva',
      description: 'Troca de tela iPhone X',
      status: 'Finalizado',
      final_cost: 350.00,
      created_at: '2024-07-01T10:00:00Z',
      actual_completion_date: '2024-07-02T14:00:00Z',
    },
    {
      repair_id: 'REP002',
      customer_name: 'Maria Souza',
      description: 'Reparo de bateria Samsung S20',
      status: 'Entregue',
      final_cost: 180.00,
      created_at: '2024-07-05T09:30:00Z',
      actual_completion_date: '2024-07-05T11:00:00Z',
    },
    {
      repair_id: 'REP003',
      customer_name: 'Carlos Pereira',
      description: 'Diagnóstico de placa-mãe',
      status: 'Em Andamento',
      final_cost: 0.00,
      created_at: '2024-07-10T15:00:00Z',
      actual_completion_date: null,
    },
  ],
  // You can add other AdvancedTable props here, like enablePagination, enableSearch, etc.
  enablePagination: true,
  enableSearch: true,
  searchPlaceholder: 'Buscar reparo...',
};