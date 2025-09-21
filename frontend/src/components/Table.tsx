import React, { useState, useMemo } from 'react';
import { StyledTableContainer, StyledTable } from './Table.styled';
import Pagination from './Pagination';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Input from './Input'; // Assuming Input component is now default export
import styled from 'styled-components';

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};

  > div {
    flex-grow: 1;
  }
`;

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const Table = <T extends object>({ data, columns, itemsPerPage = 10, onPageChange }: TableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [filterText, setFilterText] = useState('');

  const filteredData = useMemo(() => {
    if (!filterText) {
      return data;
    }
    const lowercasedFilter = filterText.toLowerCase();
    return data.filter(item =>
      columns.some(column => {
        const value = (item as any)[column.key];
        return String(value).toLowerCase().includes(lowercasedFilter);
      })
    );
  }, [data, filterText, columns]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const handleSortChange = (columnKey: keyof T | string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prevDirection) => {
        if (prevDirection === 'asc') return 'desc';
        if (prevDirection === 'desc') return null;
        return 'asc';
      });
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  const getSortIcon = (columnKey: keyof T | string) => {
    if (sortColumn !== columnKey) return <FaSort />;
    if (sortDirection === 'asc') return <FaSortUp />;
    if (sortDirection === 'desc') return <FaSortDown />;
    return <FaSort />;
  };

  return (
    <StyledTableContainer>
      <TableControls>
        <Input
          label="Filtrar"
          type="text"
          placeholder="Buscar..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </TableControls>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} onClick={() => column.sortable && handleSortChange(column.key)}>
                {column.header} {column.sortable && getSortIcon(column.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="no-data">
                No data available
              </td>
            </tr>
          ) : (
            paginatedData.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </StyledTable>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </StyledTableContainer>
  );
};

export default Table;
