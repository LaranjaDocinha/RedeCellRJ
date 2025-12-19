import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Pagination,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import SaleDetailsModal from '../../components/POS/SaleDetailsModal'; // Import SaleDetailsModal

// Define interfaces for data
interface Payment {
  method: string;
  amount: string;
}

interface Sale {
  id: string;
  total_amount: string;
  sale_date: string;
  user_name: string;
  customer_name: string | null;
  payments: Payment[];
}

interface SalesHistoryResponse {
  sales: Sale[];
  totalSales: number;
  page: number;
  limit: number;
  totalPages: number;
}



const fetchSalesHistory = async (
  page: number,
  limit: number,
  filters: { startDate?: string; endDate?: string; customerId?: string; userId?: string }
): Promise<SalesHistoryResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };
  const response = await axios.get('/api/sales/history', { params });
  return response.data;
};

const SalesHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerId: '',
    userId: '',
  });
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<SalesHistoryResponse, Error>(
    ['salesHistory', page, limit, filters],
    () => fetchSalesHistory(page, limit, filters),
    {
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    refetch();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewDetails = (saleId: string) => {
    setSelectedSaleId(saleId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSaleId(null);
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Histórico de Vendas
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Data Início"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Data Fim"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="ID do Cliente"
            name="customerId"
            value={filters.customerId}
            onChange={handleFilterChange}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="ID do Usuário"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ height: 56 }}
          >
            Buscar
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID da Venda</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Pagamentos</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{format(new Date(sale.sale_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>R$ {parseFloat(sale.total_amount).toFixed(2)}</TableCell>
                <TableCell>{sale.user_name}</TableCell>
                <TableCell>{sale.customer_name || 'N/A'}</TableCell>
                <TableCell>
                  {sale.payments.map((p, index) => (
                    <Typography key={index} variant="body2">
                      {p.method}: R$ {parseFloat(p.amount).toFixed(2)}
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(sale.id)} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {data?.sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={data?.totalPages || 1}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {selectedSaleId && (
        <SaleDetailsModal
          open={isModalOpen}
          onClose={handleCloseModal}
          saleId={selectedSaleId}
        />
      )}
    </Box>
  );
};

export default SalesHistoryPage;
