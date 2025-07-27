import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Table, Input, Pagination, PaginationItem, PaginationLink, Spinner } from 'reactstrap';
import EmptyState from './EmptyState'; // Importar EmptyState
import './AdvancedTable.scss';

const AdvancedTable = ({ 
  data, 
  columns, 
  loading, 
  actions, // Adicionar actions
  onRowClick,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateActionText,
  onEmptyStateActionClick,
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="advanced-table-container">
      <div className="table-controls">
        <Input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(String(e.target.value))}
          className="form-control-sm"
          placeholder="Pesquisar em todas as colunas..."
        />
        <div className="table-actions">
          {actions}
        </div>
      </div>

      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center p-5">
                  <Spinner />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState 
                    icon={emptyStateIcon}
                    title={emptyStateTitle}
                    message={emptyStateMessage}
                    actionText={emptyStateActionText}
                    onActionClick={onEmptyStateActionClick}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} onClick={() => onRowClick && onRowClick(row.original)} style={onRowClick ? { cursor: 'pointer' } : {}}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            Página{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </strong>
          </div>
          <Pagination>
            <PaginationItem disabled={!table.getCanPreviousPage()}>
              <PaginationLink onClick={() => table.setPageIndex(0)}>
                {'<<'}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem disabled={!table.getCanPreviousPage()}>
              <PaginationLink onClick={() => table.previousPage()}>
                {'<'}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem disabled={!table.getCanNextPage()}>
              <PaginationLink onClick={() => table.nextPage()}>
                {'>'}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem disabled={!table.getCanNextPage()}>
              <PaginationLink onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
                {'>>'}
              </PaginationLink>
            </PaginationItem>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AdvancedTable;
