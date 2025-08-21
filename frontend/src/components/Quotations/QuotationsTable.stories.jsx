import React from 'react';
import AdvancedTable from '@components/Common/AdvancedTable'; // Import the existing AdvancedTable
import StatusBadge from '@components/Quotations/StatusBadge'; // Import the new StatusBadge
import '@src/index.css'; // Import global styles if needed for Storybook
import '@assets/scss/theme.scss'; // Adjust path as necessary for your theme variables // Adjust path as necessary for your theme variables

export default {
  title: 'Quotations/QuotationsTable',
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
  title: 'Lista de Orçamentos',
  columns: [
    {
      Header: 'ID',
      accessor: 'id',
    },
    {
      Header: 'Cliente',
      accessor: 'customer_name',
    },
    {
      Header: 'Data da Cotação',
      accessor: 'quotation_date',
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: 'Válido Até',
      accessor: 'valid_until_date',
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: 'Valor Total',
      accessor: 'total_amount',
      Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}`,
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      Header: 'Criado Por',
      accessor: 'user_name',
    },
    {
      Header: 'Ações',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <button className="btn btn-sm btn-info me-2">Ver</button>
          <button className="btn btn-sm btn-warning me-2">Editar</button>
          <button className="btn btn-sm btn-danger">Excluir</button>
        </div>
      ),
    },
  ],
  data: [
    {
      id: 1,
      customer_name: 'João Silva',
      quotation_date: '2024-07-15T10:00:00Z',
      valid_until_date: '2024-07-22T17:00:00Z',
      total_amount: 1250.00,
      status: 'Sent',
      user_name: 'Admin',
    },
    {
      id: 2,
      customer_name: 'Maria Souza',
      quotation_date: '2024-07-10T14:30:00Z',
      valid_until_date: '2024-07-17T17:00:00Z',
      total_amount: 500.00,
      status: 'Approved',
      user_name: 'Vendedor 1',
    },
    {
      id: 3,
      customer_name: 'Carlos Pereira',
      quotation_date: '2024-07-01T09:00:00Z',
      valid_until_date: '2024-07-08T17:00:00Z',
      total_amount: 3000.00,
      status: 'Rejected',
      user_name: 'Admin',
    },
    {
      id: 4,
      customer_name: 'Ana Costa',
      quotation_date: '2024-07-20T11:00:00Z',
      valid_until_date: '2024-07-27T17:00:00Z',
      total_amount: 750.00,
      status: 'Draft',
      user_name: 'Vendedor 2',
    },
    {
      id: 5,
      customer_name: 'Pedro Santos',
      quotation_date: '2024-06-25T16:00:00Z',
      valid_until_date: '2024-07-02T17:00:00Z',
      total_amount: 200.00,
      status: 'ConvertedToSale',
      user_name: 'Vendedor 1',
    },
  ],
  enablePagination: true,
  enableSearch: true,
  searchPlaceholder: 'Buscar orçamento...',
};