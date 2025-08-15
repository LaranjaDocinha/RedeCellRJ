import React, { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  Row,
  Col,
  Button,
  Input,
  FormGroup,
  Label,
  Spinner
} from 'reactstrap';

const ActivityLogTable = ({ columns = [], data, loading, pageCount: controlledPageCount, onFetchData }) => {
  const [sorting, setSorting] = useState([]);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const pagination = React.useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    columns: (columns || []).filter(Boolean), // Ensure columns is an array and filter out any undefined/null entries
    data,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: controlledPageCount,
  });

  useEffect(() => {
    onFetchData({ pageIndex, pageSize });
  }, [onFetchData, pageIndex, pageSize]);

  if (loading && data.length === 0) {
    return <div className="text-center p-4"><Spinner /> Carregando logs...</div>;
  }

  if (!loading && data.length === 0) {
    return <div className="text-center p-4">Nenhum registro de atividade encontrado.</div>;
  }

  return (
    <>
      <div className="table-responsive">
        <Table bordered striped hover className="mb-0">
          <thead className="table-light">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} colSpan={header.colSpan} style={{ cursor: 'pointer' }} onClick={header.column.getToggleSortingHandler()}>
                    {
                      header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                    }
                    <span className='ms-1'>
                      {{ asc: <i className="bx bx-sort-up"></i>, desc: <i className="bx bx-sort-down"></i> }[header.column.getIsSorted()] ?? <i className="bx bx-sort"></i>}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Row className="justify-content-md-end justify-content-center align-items-center mt-3">
        <Col md={2} className="d-flex align-items-center">
          <FormGroup className="mb-0 me-2">
            <Label for="pageSizeSelect">Mostrar</Label>
          </FormGroup>
          <Input
            type="select"
            id="pageSizeSelect"
            bsSize="sm"
            value={pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[10, 15, 20, 30, 40, 50].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Input>
        </Col>
        <Col md={3} className="d-flex align-items-center">
          <span className="me-2">Página</span>
          <strong>
            {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </strong>
        </Col>
        <Col md={3}>
          <div className="d-flex gap-1">
            <Button color="primary" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}> {'<<'} </Button>
            <Button color="primary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}> {'<'} </Button>
            <Button color="primary" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}> {'>'} </Button>
            <Button color="primary" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}> {'>>'} </Button>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ActivityLogTable;
