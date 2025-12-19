import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import DataTable, { DataTableProps } from '../components/DataTable';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

export default {
  title: 'Components/DataTable',
  component: DataTable,
  argTypes: {
    loading: { control: 'boolean' },
    pageSize: { control: { type: 'select', options: [5, 10, 25, 50] } },
    paginationMode: { control: { type: 'radio', options: ['server', 'client'] } },
    emptyStateMessage: { control: 'text' },
  },
} as Meta;

const Template: StoryFn<DataTableProps> = (args) => <DataTable {...args} />;

const sampleColumns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'firstName', headerName: 'Primeiro Nome', width: 150, editable: true },
  { field: 'lastName', headerName: 'Sobrenome', width: 150, editable: true },
  {
    field: 'age',
    headerName: 'Idade',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Nome Completo',
    description: 'Este campo não é classificável.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
];

const sampleRows: GridRowsProp = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export const Default = Template.bind({});
Default.args = {
  rows: sampleRows,
  columns: sampleColumns,
  loading: false,
  pageSize: 5,
  rowCount: sampleRows.length,
  paginationMode: 'client',
  emptyStateMessage: 'Nenhum dado para exibir.',
};

export const LoadingState = Template.bind({});
LoadingState.args = {
  rows: [],
  columns: sampleColumns,
  loading: true,
  emptyStateMessage: 'Carregando dados...',
};

export const EmptyState = Template.bind({});
EmptyState.args = {
  rows: [],
  columns: sampleColumns,
  loading: false,
  emptyStateMessage: 'Nenhum item corresponde aos seus critérios de busca.',
};

export const ServerPagination = Template.bind({});
ServerPagination.args = {
  rows: sampleRows.slice(0, 2), // Simulate a server returning only a few rows
  columns: sampleColumns,
  loading: false,
  pageSize: 2,
  rowCount: sampleRows.length, // Total count from server
  paginationMode: 'server',
  onPageChange: (page) => console.log('Page changed to:', page),
  onPageSizeChange: (pageSize) => console.log('Page size changed to:', pageSize),
  emptyStateMessage: 'Nenhum dado encontrado no servidor.',
};
