import React from 'react';
import { DataGrid, GridColDef, GridRowsProp, GridEventListener } from '@mui/x-data-grid';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

export interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  pageSize?: number;
  rowsPerPageOptions?: number[];
  rowCount?: number;
  paginationMode?: 'server' | 'client';
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortModelChange?: (sortModel: any) => void;
  onRowClick?: GridEventListener<'rowClick'>;
  emptyStateMessage?: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  loading = false,
  pageSize = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  rowCount = 0,
  paginationMode = 'client',
  onPageChange,
  onPageSizeChange,
  onSortModelChange,
  onRowClick,
  emptyStateMessage = 'Nenhum dado encontrado',
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ width: '100%' }}
    >
      <Paper elevation={3} sx={{ height: 400, width: '100%', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={pageSize}
          rowsPerPageOptions={rowsPerPageOptions}
          rowCount={rowCount}
          paginationMode={paginationMode}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSortModelChange={onSortModelChange}
          onRowClick={onRowClick}
          disableSelectionOnClick
          autoHeight // Ajusta a altura automaticamente com base nas linhas
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: (theme) => theme.palette.primary.light,
              color: (theme) => theme.palette.primary.contrastText,
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
                cursor: 'pointer',
              },
            },
          }}
          localeText={{
            noRowsLabel: emptyStateMessage,
            MuiTablePagination: {
              labelRowsPerPage: 'Linhas por página:',
              labelDisplayedRows: ({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
            },
            // Adicionar mais traduções conforme necessário
          }}
        />
      </Paper>
    </motion.div>
  );
};

export default DataTable;
