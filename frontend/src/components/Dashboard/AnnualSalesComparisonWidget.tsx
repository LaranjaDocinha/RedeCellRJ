import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * @interface AnnualSalesData
 * @description Define a estrutura dos dados de vendas anuais.
 * @property {string} year - O ano.
 * @property {number} totalSales - O total de vendas para o ano.
 */
interface AnnualSalesData {
  year: string;
  totalSales: number;
}

/**
 * @function fetchAnnualSalesComparison
 * @description Função assíncrona para buscar os dados de vendas anuais comparativas.
 * @param {string} token - Token de autenticação do usuário.
 * @returns {Promise<AnnualSalesData[]>} Uma promessa que resolve com os dados de vendas anuais.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchAnnualSalesComparison = async (token: string): Promise<AnnualSalesData[]> => {
  // Note: This widget does not use selectedPeriod as it's for annual comparison
  const response = await fetch(`/api/annual-sales-comparison`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * @interface AnnualSalesComparisonWidgetProps
 * @description Propriedades para o componente AnnualSalesComparisonWidget.
 */
interface AnnualSalesComparisonWidgetProps {
  // No selectedPeriod prop as it's for annual comparison
}

/**
 * @function AnnualSalesComparisonWidget
 * @description Componente de widget que exibe um comparativo de vendas anuais.
 * @param {AnnualSalesComparisonWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente AnnualSalesComparisonWidget.
 */
const AnnualSalesComparisonWidget: React.FC<AnnualSalesComparisonWidgetProps> = React.memo(() => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data, isLoading, isError, error } = useQuery<AnnualSalesData[], Error>({
    queryKey: ['annualSalesComparison', token],
    queryFn: () => fetchAnnualSalesComparison(token!),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar comparativo de vendas anuais: ${error.message}`, 'error');
    }
  }, [isError, error, addToast]);

  if (isLoading) {
    return <DashboardWidgetSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          color: (theme) => theme.palette.text.secondary,
          minHeight: 200,
        }}
      >
        <Typography variant="body1" fontWeight="bold">Nenhum dado de vendas anuais disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Registre vendas ao longo dos anos para ver a comparação.
        </Typography>
      </Box>
    );
  }

  // Prepara os dados para o ApexCharts
  const chartSeries = [{
    name: 'Vendas',
    data: data.map(item => item.totalSales)
  }];
  const chartOptions = {
    chart: {
      type: 'line' as 'line',
      height: 350,
      foreColor: 'inherit',
    },
    xaxis: {
      categories: data.map(item => item.year),
      labels: {
        style: {
          colors: 'inherit',
        }
      }
    },
    yaxis: {
      title: {
        text: 'Vendas (R$)',
        style: {
            color: 'inherit',
        }
      },
      labels: {
        formatter: function (val: number) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        },
        style: {
            colors: 'inherit',
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Chart options={chartOptions} series={chartSeries} type="line" height={300} />
    </motion.div>
  );
});

export default AnnualSalesComparisonWidget;
