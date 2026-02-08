import React, { useState } from 'react';
import { useLoaderData, useNavigate, useNavigation, useLocation } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Stack, 
  Button, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  useTheme,
  LinearProgress
} from '@mui/material';
import { FaRocket, FaSync, FaMoneyBillWave, FaShoppingCart, FaChartLine, FaUsers } from 'react-icons/fa';

// Widgets
import StatCard from '../components/Dashboard/StatCard';
import SalesByMonthChartWidget from '../components/Dashboard/SalesByMonthChartWidget';
import TopSellingProductsChartWidget from '../components/Dashboard/TopSellingProductsChartWidget';
import SalesHeatmapWidget from '../components/Dashboard/SalesHeatmapWidget';
import StockABCWidget from '../components/Dashboard/StockABCWidget';
import { InteractiveGlow } from '../components/ui/GlowCard';
import PageTransition from '../components/PageTransition';
import DashboardSkeleton from '../components/Dashboard/DashboardSkeleton';

// Styled Components / Animations
import { motion } from 'framer-motion';

const StaggeredContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div initial="hidden" animate="visible" variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}>
    {children}
  </motion.div>
);

const StaggeredItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }}>
    {children}
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();
  const data = useLoaderData() as any;

  const queryParams = new URLSearchParams(location.search);
  const period = queryParams.get('period') || 'thisMonth';

  const handlePeriodChange = (newPeriod: string) => {
    const params = new URLSearchParams(location.search);
    params.set('period', newPeriod);
    navigate({ search: params.toString() });
  };

  const isNavigating = navigation.state === 'loading';

  if (isNavigating) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh', position: 'relative' }}>
        
        {isNavigating && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />
        )}

        {/* Header Analítico */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
              <Typography variant="h4" fontWeight={400} sx={{ 
                  letterSpacing: '-1.5px', 
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2 
              }}>
                  <FaRocket /> Centro de Comando
              </Typography>
              <Typography variant="body2" color="text.secondary">Dados consolidados da rede em tempo real</Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Período</InputLabel>
                  <Select value={period} label="Período" onChange={(e) => handlePeriodChange(e.target.value)}>
                      <MenuItem value="today">Hoje</MenuItem>
                      <MenuItem value="last7days">Últimos 7 dias</MenuItem>
                      <MenuItem value="thisMonth">Este Mês</MenuItem>
                      <MenuItem value="lastMonth">Mês Passado</MenuItem>
                  </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<FaSync />} onClick={() => navigate('.', { replace: true })} sx={{ height: 40, borderRadius: '10px' }}>Sincronizar</Button>
          </Stack>
        </Stack>

        <StaggeredContainer>
          <Grid container spacing={3} sx={{ opacity: isNavigating ? 0.6 : 1, transition: 'opacity 0.2s', mb: 4 }}>
            <Grid size={{ xs: 12, md: 3 }}>
                <StaggeredItem>
                    <InteractiveGlow>
                        <StatCard 
                            title="Vendas Totais" 
                            value={`R$ ${Number(data?.totalSales?.mainPeriodSales || 0).toLocaleString()}`} 
                            icon={<FaMoneyBillWave />} 
                            color={theme.palette.primary.main}
                        />
                    </InteractiveGlow>
                </StaggeredItem>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
                <StaggeredItem>
                    <InteractiveGlow>
                        <StatCard 
                            title="Ticket Médio" 
                            value="R$ 452,00" 
                            icon={<FaShoppingCart />} 
                            color={theme.palette.secondary.main}
                        />
                    </InteractiveGlow>
                </StaggeredItem>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
                <StaggeredItem>
                    <InteractiveGlow>
                        <StatCard 
                            title="Previsão Final Mês" 
                            value={`R$ ${Number(data?.salesForecast?.mainPeriodSalesForecast?.projected_sales || 0).toLocaleString()}`} 
                            icon={<FaChartLine />} 
                            color="#2ecc71"
                        />
                    </InteractiveGlow>
                </StaggeredItem>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
                <StaggeredItem>
                    <InteractiveGlow>
                        <StatCard 
                            title="Taxa de Conversão" 
                            value="68%" 
                            icon={<FaUsers />} 
                            color="#9b59b6"
                        />
                    </InteractiveGlow>
                </StaggeredItem>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Gráficos de Tendência */}
            <Grid size={{ xs: 12, lg: 8 }}>
                <StaggeredItem>
                    <Paper sx={{ p: 3, borderRadius: '24px', height: '100%' }}>
                        <SalesByMonthChartWidget 
                            data={data?.salesByMonth?.mainPeriodSalesByMonth || []} 
                        />
                    </Paper>
                </StaggeredItem>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
                <StaggeredItem>
                    <Paper sx={{ p: 3, borderRadius: '24px', height: '100%' }}>
                        <TopSellingProductsChartWidget 
                            data={data?.topSellingProducts?.mainPeriodTopSellingProducts || []} 
                        />
                    </Paper>
                </StaggeredItem>
            </Grid>

            {/* Inteligência de Estoque e Operação */}
            <Grid size={{ xs: 12, lg: 6 }}>
                <StaggeredItem>
                    <Paper sx={{ p: 3, borderRadius: '24px' }}>
                        <StockABCWidget data={data?.stockABC} />
                    </Paper>
                </StaggeredItem>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
                <StaggeredItem>
                    <Paper sx={{ p: 3, borderRadius: '24px' }}>
                        <SalesHeatmapWidget data={data?.hourlySales} />
                    </Paper>
                </StaggeredItem>
            </Grid>
          </Grid>
        </StaggeredContainer>
      </Box>
    </PageTransition>
  );
};

export default DashboardPage;