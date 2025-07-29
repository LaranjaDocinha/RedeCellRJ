import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import './AdvancedTable.scss';

// Hook customizado para gerenciar a persistência do estado da tabela
const useTablePersistence = (persistenceKey, columns) => {
  const getInitialState = () => {
    try {
      const savedState = localStorage.getItem(persistenceKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Garante que as colunas salvas correspondam às colunas atuais
        const initialVisibility = columns.reduce((acc, col) => {
          acc[col.accessorKey] = parsedState.columnVisibility?.[col.accessorKey] ?? true;
          return acc;
        }, {});
        return { ...parsedState, columnVisibility: initialVisibility };
      }
    } catch (error) {
      console.error('Falha ao carregar o estado da tabela:', error);
    }
    // Estado padrão se nada for salvo
    return {
      sorting: [],
      globalFilter: '',
      columnVisibility: columns.reduce((acc, col) => {
        acc[col.accessorKey] = col.defaultVisible ?? true;
        return acc;
      }, {}),
    };
  };

  const [sorting, setSorting] = useState(getInitialState().sorting);
  const [globalFilter, setGlobalFilter] = useState(getInitialState().globalFilter);
  const [columnVisibility, setColumnVisibility] = useState(getInitialState().columnVisibility);

  useEffect(() => {
    const stateToSave = { sorting, globalFilter, columnVisibility };
    localStorage.setItem(persistenceKey, JSON.stringify(stateToSave));
  }, [sorting, globalFilter, columnVisibility, persistenceKey]);

  return {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
  };
};

const AdvancedTable = ({
  data,
  columns,
  loading,
  actions,
  onRowClick,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateActionText,
  onEmptyStateActionClick,
  persistenceKey, // Chave única para persistência
}) => {
  if (!persistenceKey) {
    throw new Error("A prop 'persistenceKey' é obrigatória para AdvancedTable.");
  }

  const {
    sorting,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
  } = useTablePersistence(persistenceKey, columns);

  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const toggleColumnDropdown = () => setColumnDropdownOpen((prevState) => !prevState);

  return (
    <div className='advanced-table-container'>
      <div className='table-controls'>
        <Input
          className='form-control-sm'
          placeholder='Pesquisar em todas as colunas...'
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(String(e.target.value))}
        />
        <div className='table-actions'>
          <Dropdown isOpen={columnDropdownOpen} toggle={toggleColumnDropdown}>
            <DropdownToggle caret outline color='secondary'>
              <i className='bx bx-column me-2'></i>
              Colunas
            </DropdownToggle>
            <DropdownMenu>
              {table.getAllLeafColumns().map((column) => (
                <DropdownItem
                  key={column.id}
                  toggle={false}
                  onClick={column.getToggleVisibilityHandler()}
                >
                  <Input
                    readOnly
                    checked={column.getIsVisible()}
                    className='me-2'
                    type='checkbox'
                  />
                  {flexRender(column.columnDef.header, { column, table })}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          {actions}
        </div>
      </div>

      <div className='table-responsive'>
        <Table hover className='mb-0'>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          role='button'
                          tabIndex={0} // Torna o div focável
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                              header.column.getToggleSortingHandler()(e);
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div>
                            <Input
                              className='form-control-sm'
                              placeholder={`Filtrar ${header.column.columnDef.header}`}
                              type='text'
                              value={header.column.getFilterValue() ?? ''}
                              onChange={(e) => header.column.setFilterValue(e.target.value)}
                            />
                          </div>
                        ) : null}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className='text-center p-5' colSpan={columns.length}>
                  <LoadingSpinner />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    actionText={emptyStateActionText}
                    icon={emptyStateIcon}
                    message={emptyStateMessage}
                    title={emptyStateTitle}
                    onActionClick={onEmptyStateActionClick}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
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
        <div className='pagination-controls'>
          <div className='pagination-info'>
            Página{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </strong>
          </div>
          <Pagination>
            <PaginationItem disabled={!table.getCanPreviousPage()}>
              <PaginationLink onClick={() => table.setPageIndex(0)}>{'<<'}</PaginationLink>
            </PaginationItem>
            <PaginationItem disabled={!table.getCanPreviousPage()}>
              <PaginationLink onClick={() => table.previousPage()}>{'<'}</PaginationLink>
            </PaginationItem>
            <PaginationItem disabled={!table.getCanNextPage()}>
              <PaginationLink onClick={() => table.nextPage()}>{'>'}</PaginationLink>
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
