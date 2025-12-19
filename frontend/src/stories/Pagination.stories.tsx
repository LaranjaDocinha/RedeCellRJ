import type { Meta, StoryObj } from '@storybook/react';
import Pagination from '../components/Pagination';
import { useState } from 'react';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const PaginationWrapper = (args: any) => {
  const [page, setPage] = useState(args.currentPage || 1);
  return (
    <Pagination
      {...args}
      currentPage={page}
      onPageChange={(newPage) => {
        setPage(newPage);
        args.onPageChange?.(newPage);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 1,
    totalPages: 10,
  },
};

export const ManyPages: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 5,
    totalPages: 50,
  },
};

export const FewPages: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 1,
    totalPages: 3,
  },
};

export const LastPage: Story = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    currentPage: 10,
    totalPages: 10,
  },
};
