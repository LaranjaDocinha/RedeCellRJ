import type { Meta, StoryObj } from '@storybook/react';
import Table from '../components/Table';
import { fn } from '@storybook/test';

const mockData = [
    { id: 1, name: 'Item 1', status: 'Active', value: 100 },
    { id: 2, name: 'Item 2', status: 'Inactive', value: 50 },
    { id: 3, name: 'Item 3', status: 'Active', value: 200 },
    { id: 4, name: 'Item 4', status: 'Pending', value: 75 },
    { id: 5, name: 'Item 5', status: 'Active', value: 120 },
];

const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'value', header: 'Value', sortable: true, render: (item: any) => `$${item.value}` },
];

const meta: Meta<typeof Table> = {
  title: 'Components/Tables/Table',
  component: Table,
  tags: ['autodocs'],
  args: {
      onPageChange: fn(),
  }
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    data: mockData,
    columns: columns,
    itemsPerPage: 3,
  },
};

export const Empty: Story = {
    args: {
      data: [],
      columns: columns,
    },
  };
