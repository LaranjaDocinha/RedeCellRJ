import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme, LinearProgress, Stack, Tooltip } from '@mui/material';
import Chart from 'react-apexcharts';
import { FaInfoCircle } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { getContributionMarginByCategory, getBreakEvenPoint, getCustomerLTV, getCustomerAcquisitionCost } from '../../../services/reportService';

const ReportCard: React.FC<{ title: string; info?: string; children: React.ReactNode }> = ({ title, info, children }) => (
  <Card sx={{ height: '100%', borderRadius: '16px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={400}>{title}</Typography>
        {info && (
            <Tooltip title={info}>
                <Box component="span" sx={{ color: 'text.secondary', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><FaInfoCircle size={14} /></Box>
            </Tooltip>
        )}
      </Box>
      {children}
    </CardContent>
  </Card>
);

const FinanceReports: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const { data: contributionMarginData, isLoading: isLoadingMargin } = useQuery({
    queryKey: ['contributionMarginByCategory'],
    queryFn: () => getContributionMarginByCategory(token!),
    enabled: !!token,
    onError: (error: any) => {
      addNotification(`Erro ao carregar Margem de Contribuição: ${error.message}`, 'error');
    },
  });

  const { data: breakEvenPointData, isLoading: isLoadingBreakEven } = useQuery({
    queryKey: ['breakEvenPoint'],
    queryFn: () => getBreakEvenPoint(token!),
    enabled: !!token,
    onError: (error: any) => {
      addNotification(`Erro ao carregar Ponto de Equilíbrio: ${error.message}`, 'error');
    },
  });

  const { data: customerLTVData, isLoading: isLoadingLTV } = useQuery({
    queryKey: ['customerLTV'],
    queryFn: () => getCustomerLTV(token!),
    enabled: !!token,
    onError: (error: any) => {
      addNotification(`Erro ao carregar LTV: ${error.message}`, 'error');
    },
  });

  const { data: customerCACData, isLoading: isLoadingCAC } = useQuery({
    queryKey: ['customerAcquisitionCost'],
    queryFn: () => getCustomerAcquisitionCost(token!),
    enabled: !!token,
    onError: (error: any) => {
      addNotification(`Erro ao carregar CAC: ${error.message}`, 'error');
    },
  });

  const marginCategories = contributionMarginData?.map((item: any) => item.category_name) || [];
  const marginData = contributionMarginData?.map((item: any) => parseFloat(item.contribution_margin)) || [];

  const ltvCustomers = customerLTVData?.map((item: any) => item.customer_name) || [];
  const ltvValues = customerLTVData?.map((item: any) => parseFloat(item.lifetime_value)) || [];

  const cacValue = customerCACData?.cac || 0;

  return (
    <Grid container spacing={3}>
      
      {/* 1. Margem de Contribuição por Categoria */}
      <Grid item xs={12} md={6}>
        <ReportCard title="Margem de Contribuição por Categoria" info="Análise do lucro líquido real descontando custos fixos e variáveis.">
          {isLoadingMargin ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Chart 
              options={{
                chart: { type: 'bar', stacked: false, toolbar: { show: false } },
                plotOptions: { bar: { horizontal: true, barHeight: '60%' } },
                xaxis: { categories: marginCategories },
                colors: [theme.palette.success.main],
                legend: { show: false },
                dataLabels: { enabled: true, formatter: (val: any) => `R$ ${val.toFixed(2)}` },
                theme: { mode: theme.palette.mode }
              }}
              series={[
                { name: 'Margem de Contribuição', data: marginData }
              ]}
              type="bar"
              height={300}
            />
          )}
        </ReportCard>
      </Grid>

      {/* 2. Ponto de Equilíbrio (Break-Even) */}
      <Grid item xs={12} md={6}>
        <ReportCard title="Ponto de Equilíbrio (Mês Atual)" info="Quanto falta vender para cobrir todos os custos.">
          {isLoadingBreakEven ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={400} color="primary">
                R$ {breakEvenPointData?.totalRevenue ? breakEvenPointData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Meta de Equilíbrio: R$ {breakEvenPointData?.breakEvenPoint ? breakEvenPointData.breakEvenPoint.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
              </Typography>
              <LinearProgress 
                  variant="determinate" 
                  value={breakEvenPointData?.percentageTowardsBreakEven ? Math.min(100, breakEvenPointData.percentageTowardsBreakEven) : 0} 
                  sx={{ height: 12, borderRadius: 6, mb: 2, bgcolor: theme.palette.action.hover }} 
              />
              <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" fontWeight={400}>
                    {breakEvenPointData?.percentageTowardsBreakEven ? Math.min(100, breakEvenPointData.percentageTowardsBreakEven).toFixed(0) : '0'}% CONCLUÍDO
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {breakEvenPointData && breakEvenPointData.totalRevenue < breakEvenPointData.breakEvenPoint ? 
                      `FALTA R$ ${(breakEvenPointData.breakEvenPoint - breakEvenPointData.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                      'META ATINGIDA!'
                    }
                  </Typography>
              </Stack>
            </Box>
          )}
        </ReportCard>
      </Grid>

      {/* 3. LTV (Lifetime Value) */}
      <Grid item xs={12} md={6}>
        <ReportCard title="Lifetime Value (LTV) por Cliente" info="Valor total gerado por cada cliente ao longo do seu histórico.">
          {isLoadingLTV ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Chart 
              options={{
                chart: { type: 'bar', toolbar: { show: false } },
                plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
                xaxis: { categories: ltvCustomers },
                colors: [theme.palette.primary.main],
                legend: { show: false },
                dataLabels: { enabled: true, formatter: (val: any) => `R$ ${val.toFixed(2)}` },
                theme: { mode: theme.palette.mode }
              }}
              series={[
                { name: 'LTV', data: ltvValues }
              ]}
              type="bar"
              height={300}
            />
          )}
        </ReportCard>
      </Grid>

      {/* 4. CAC (Custo de Aquisição de Cliente) */}
      <Grid item xs={12} md={6}>
        <ReportCard title="Custo de Aquisição de Cliente (CAC)" info="Custo médio para conquistar um novo cliente.">
          {isLoadingCAC ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
               <Typography variant="h1" fontWeight={400} color="secondary">
                 R$ {cacValue.toFixed(2)}
               </Typography>
               <Typography variant="subtitle1" color="text.secondary">
                 por cliente
               </Typography>
            </Box>
          )}
        </ReportCard>
      </Grid>

    </Grid>
  );
};

export default FinanceReports;

