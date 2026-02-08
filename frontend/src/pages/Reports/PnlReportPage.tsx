import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Button, Card, CardContent, CircularProgress, Grid, Typography, Divider, Stack } from '@mui/material';
import { format } from 'date-fns';
import PageHeader from '../../components/Shared/PageHeader';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface PnlData {
  grossRevenue: number;
  taxes: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  commissions: number;
  netProfit: number;
  margin: number;
}

const PnlReportPage = () => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(1))); // Primeiro dia do mês
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
      const response = await axios.get('/api/finance/dre', {
          params: { startDate: formattedStartDate, endDate: formattedEndDate },
          headers: { Authorization: `Bearer ${token}` }
      });
      setPnlData(response.data);
    } catch (err: any) {
      setError('Erro ao gerar DRE.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const renderRow = (label: string, value: number, isNegative = false, isBold = false) => (
      <Box display="flex" justifyContent="space-between" py={1} borderBottom={isBold ? "2px solid #eee" : "1px solid #f5f5f5"}>
          <Typography fontWeight={isBold ? 600 : 400} color={isBold ? "text.primary" : "text.secondary"}>{label}</Typography>
          <Typography fontWeight={isBold ? 600 : 400} color={isNegative ? "error.main" : "text.primary"}>
              {isNegative && value > 0 ? '-' : ''} {formatCurrency(value)}
          </Typography>
      </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <PageHeader title="DRE Gerencial" subtitle="Demonstrativo de Resultado do Exercício" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Financeiro' }, { label: 'DRE' }]} />
        
        <Paper sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <DatePicker label="Início" value={startDate} onChange={(n) => setStartDate(n)} slotProps={{ textField: { size: 'small' } }} />
                <DatePicker label="Fim" value={endDate} onChange={(n) => setEndDate(n)} slotProps={{ textField: { size: 'small' } }} />
                <Button variant="contained" onClick={handleGenerateReport} disabled={loading} sx={{ borderRadius: '10px' }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Gerar Relatório'}
                </Button>
            </Stack>
        </Paper>

        {error && <Typography color="error">{error}</Typography>}

        {pnlData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 4, borderRadius: '16px' }}>
                    <Typography variant="h6" gutterBottom>Estrutura do Resultado</Typography>
                    {renderRow("Receita Bruta", pnlData.grossRevenue, false, true)}
                    {renderRow("(-) Impostos (Simples Nacional)", pnlData.taxes, true)}
                    {renderRow("(=) Receita Líquida", pnlData.netRevenue, false, true)}
                    <Box my={2} />
                    {renderRow("(-) Custo Mercadoria Vendida (CMV)", pnlData.cogs, true)}
                    {renderRow("(=) Lucro Bruto", pnlData.grossProfit, false, true)}
                    <Box my={2} />
                    {renderRow("(-) Despesas Operacionais", pnlData.expenses, true)}
                    {renderRow("(-) Comissões", pnlData.commissions, true)}
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" py={2} bgcolor={pnlData.netProfit >= 0 ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1)} borderRadius="8px" px={2}>
                        <Typography variant="h5" fontWeight={600} color={pnlData.netProfit >= 0 ? "success.main" : "error.main"}>Lucro Líquido</Typography>
                        <Typography variant="h5" fontWeight={600} color={pnlData.netProfit >= 0 ? "success.main" : "error.main"}>{formatCurrency(pnlData.netProfit)}</Typography>
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: '16px', bgcolor: 'primary.main', color: 'white' }}>
                    <CardContent>
                        <Typography variant="overline" sx={{ opacity: 0.8 }}>MARGEM DE LUCRO LÍQUIDA</Typography>
                        <Typography variant="h2" fontWeight={600} mt={1}>{pnlData.margin.toFixed(1)}%</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
                            {pnlData.margin > 20 ? "Excelente! Sua operação está muito saudável." : pnlData.margin > 10 ? "Bom. Continue otimizando custos." : "Atenção. Margem baixa."}
                        </Typography>
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
