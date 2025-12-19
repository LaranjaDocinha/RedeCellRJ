import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Button, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import { format } from 'date-fns';

// This would typically be in an api client file
const fetchPnlReport = async (startDate: string, endDate: string) => {
  const response = await fetch(`/api/pnl-report?startDate=${startDate}&endDate=${endDate}`);
  if (!response.ok) {
    throw new Error('Failed to fetch P&L report');
  }
  return response.json();
};

interface PnlData {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
}

const PnlReportPage = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [pnlData, setPnlData] = useState<PnlData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both a start and end date.');
      return;
    }

    setLoading(true);
    setError(null);
    setPnlData(null);

    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      const data = await fetchPnlReport(formattedStartDate, formattedEndDate);
      setPnlData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Relatório de Lucro e Perdas (P&L)
        </Typography>
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <DatePicker
              label="Data de Início"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
            />
          </Grid>
          <Grid item>
            <DatePicker
              label="Data de Fim"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Gerar Relatório'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {pnlData && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Receita Total</Typography>
                  <Typography variant="h5">{formatCurrency(pnlData.totalRevenue)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Custo da Mercadoria Vendida (COGS)</Typography>
                  <Typography variant="h5">{formatCurrency(pnlData.totalCogs)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Lucro Bruto</Typography>
                  <Typography variant="h5">{formatCurrency(pnlData.grossProfit)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Despesas Totais</Typography>
                  <Typography variant="h5">{formatCurrency(pnlData.totalExpenses)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ backgroundColor: pnlData.netProfit >= 0 ? '#d4edda' : '#f8d7da' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Lucro Líquido</Typography>
                  <Typography variant="h5">{formatCurrency(pnlData.netProfit)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default PnlReportPage;
