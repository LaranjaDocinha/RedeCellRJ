import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  Avatar,
  Stack,
  useTheme,
  Chip
} from '@mui/material';
import { 
  Inventory as StockIcon, 
  TrendingUp, 
  AttachMoney, 
  Assessment as ChartIcon,
  Category as CategoryIcon,
  InfoOutlined as InfoIcon,
  Calculate as CalcIcon,
  AccountBalance as AssetIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';

const InventoryValuationReport: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const handleCalculate = async () => {
    setLoading(true);
    setReportData(null);
    try {
      // Simulated data for rich UI
      await new Promise(r => setTimeout(r, 1200));
      setReportData({
        total_inventory_value: 458290.50,
        item_count: 1540,
        average_item_value: 297.59,
        valuation_method: 'Custo Médio Ponderado',
        distribution: [
          { category: 'Smartphones', value: 320000 },
          { category: 'Acessórios', value: 85000 },
          { category: 'Peças', value: 45000 },
          { category: 'Outros', value: 8290.50 }
        ]
      });
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut' },
    labels: reportData?.distribution.map((d: any) => d.category) || [],
    colors: [theme.palette.primary.main, theme.palette.secondary.main, '#4caf50', '#ff9800'],
    legend: { position: 'bottom', fontWeight: 400 },
    stroke: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Valor Total',
              formatter: () => 'R$ 458k',
              style: { fontWeight: 400, fontSize: '20px' }
            }
          }
        }
      }
    }
  };

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <AssetIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 2 }}>
              PATRIMÔNIO E ATIVOS
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Valoração de Estoque
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Análise contábil do capital imobilizado em mercadorias e insumos.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<CalcIcon />} 
          onClick={handleCalculate}
          disabled={loading}
          sx={{ borderRadius: '14px', px: 4, py: 1.5, fontWeight: 400, boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Calcular Patrimônio'}
        </Button>
      </Box>

      {reportData ? (
        <Grid container spacing={4}>
          {/* Main Stats */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" fontWeight={400} color="text.secondary">Valor Total em Estoque</Typography>
                  <Typography variant="h3" fontWeight={400} color="primary" sx={{ my: 1 }}>
                    R$ {reportData.total_inventory_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Chip label={reportData.valuation_method} size="small" variant="outlined" sx={{ fontWeight: 400 }} />
                </CardContent>
              </Card>

              <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={400} mb={3}>Métricas de Inventário</Typography>
                <Stack spacing={2.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={400}>Total de Itens</Typography>
                    <Typography variant="body2" fontWeight={400}>{reportData.item_count} un.</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={400}>Ticket Médio (Custo)</Typography>
                    <Typography variant="body2" fontWeight={400}>R$ {reportData.average_item_value.toFixed(2)}</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={400}>Giro de Estoque</Typography>
                    <Chip label="ALTO" size="small" color="success" sx={{ fontWeight: 400, height: 20, fontSize: '0.6rem' }} />
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Visualization */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={400} mb={4}>Distribuição do Capital por Categoria</Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ReactApexChart options={chartOptions} series={reportData.distribution.map((d: any) => d.value)} type="donut" width={450} />
              </Box>
              <Box mt={4} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '16px', display: 'flex', gap: 2 }}>
                <InfoIcon color="primary" />
                <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
                  Este relatório utiliza o método <strong>{reportData.valuation_method}</strong> para calcular o valor residual dos produtos considerando as movimentações de entrada e saída.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box textAlign="center" py={10}>
          <Paper sx={{ p: 10, borderRadius: '40px', border: '2px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
            <ChartIcon sx={{ fontSize: 80, color: 'divider', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={400}>Relatório pronto para processamento</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Clique em "Calcular Patrimônio" para gerar a valoração atualizada.</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default InventoryValuationReport;
