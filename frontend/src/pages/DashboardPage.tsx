import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  ToggleButtonGroup, 
  ToggleButton, 
  Container, 
  Grid, 
  useTheme 
} from '@mui/material';
import { Refresh, Settings, ShoppingBag, Groups, Receipt, PointOfSale } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import StatCard from '../components/Dashboard/StatCard';

// Widgets
import TotalSalesWidget from '../components/Dashboard/TotalSalesWidget';
import SalesByMonthChartWidget from '../components/Dashboard/SalesByMonthChartWidget';
import SalesGoalsWidget from '../components/Dashboard/SalesGoalsWidget';
import RecentSalesWidget from '../components/Dashboard/RecentSalesWidget';
import CriticalStockWidget from '../components/Dashboard/CriticalStockWidget';
import SalesHeatmapWidget from '../components/Dashboard/SalesHeatmapWidget';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const [period, setPeriod] = useState('last30days');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const [dashRes, stockRes] = await Promise.all([
        fetch(`/api/dashboard?period=${period}&comparePeriod=previousPeriod`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/inventory/low-stock', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!dashRes.ok || !stockRes.ok) throw new Error('Erro na API');
      return { ...(await dashRes.json()), criticalStock: await stockRes.json() };
    },
    enabled: !!token,
  });

  const finalData = data || {};
  const WIDGET_HEIGHT = 400;

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: '-1px' }}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Dados atualizados em tempo real</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup value={period} exclusive onChange={(_, v) => v && setPeriod(v)} size="small">
            <ToggleButton value="today" sx={{ px: 2 }}>Hoje</ToggleButton>
            <ToggleButton value="last7days" sx={{ px: 2 }}>7d</ToggleButton>
            <ToggleButton value="last30days" sx={{ px: 2 }}>30d</ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={() => refetch()} disabled={isFetching}><Refresh className={isFetching ? 'spin-animation' : ''} /></IconButton>
          <Button variant="contained" startIcon={<Settings />} sx={{ borderRadius: '10px', textTransform: 'none' }}>Inteligência</Button>
        </Box>
      </Box>

      {/* Row de Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            loading={isLoading} 
            title="Vendas Brutas" 
            value={`R$ ${(finalData.totalSales?.mainPeriodSales || 0).toLocaleString()}`} 
            icon={<PointOfSale />} 
            color={theme.palette.primary.main} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            loading={isLoading} 
            title="Ticket Médio" 
            value={`R$ ${(finalData.totalSales?.mainPeriodSales / (finalData.recentSales?.mainPeriodRecentSales?.length || 1) || 0).toFixed(2)}`} 
            icon={<Receipt />} 
            color="#9c27b0" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            loading={isLoading} 
            title="Pedidos" 
            value={finalData.recentSales?.mainPeriodRecentSales?.length || 0} 
            icon={<ShoppingBag />} 
            color="#2e7d32" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            loading={isLoading} 
            title="Clientes" 
            value="12" 
            icon={<Groups />} 
            color="#ed6c02" 
          />
        </Grid>
      </Grid>

      {/* GRID DE WIDGETS */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ height: WIDGET_HEIGHT, width: '100%', overflow: 'hidden', position: 'relative', borderRadius: '24px' }}>
            <TotalSalesWidget data={finalData} loading={isLoading} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ height: WIDGET_HEIGHT, width: '100%', overflow: 'hidden', position: 'relative', borderRadius: '24px' }}>
            <SalesByMonthChartWidget data={finalData} loading={isLoading} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ height: WIDGET_HEIGHT, width: '100%', overflow: 'hidden', position: 'relative', borderRadius: '24px' }}>
            <SalesHeatmapWidget data={finalData} loading={isLoading} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ height: WIDGET_HEIGHT, width: '100%', overflow: 'hidden', position: 'relative', borderRadius: '24px' }}>
            <SalesGoalsWidget data={finalData} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ height: WIDGET_HEIGHT, width: '100%', overflow: 'hidden', position: 'relative', borderRadius: '24px' }}>
            <RecentSalesWidget data={finalData} loading={isLoading} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ height: WIDGET_HEIGHT, width: '100%', overflow: 'hidden', position: 'relative', borderRadius: '24px' }}>
            <CriticalStockWidget data={finalData} loading={isLoading} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;