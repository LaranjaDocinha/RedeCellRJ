import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface PriceTrendData
 * @description Define a estrutura dos dados de tendência de preços.
 * @property {string} date - A data da observação do preço.
 * @property {number} price - O preço do produto/categoria na data.
 */
interface PriceTrendData {
  date: string;
  price: number;
}

/**
 * @function fetchPriceTrends
 * @description Função assíncrona para buscar os dados de tendências de preços.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<PriceTrendData[]>} Uma promessa que resolve com os dados de tendências de preços.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchPriceTrends = async (token: string, selectedPeriod: string): Promise<PriceTrendData[]> => {
  const response = await fetch(`/api/price-trends?period=${selectedPeriod}`, {
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
 * @interface PriceTrendsWidgetProps
 * @description Propriedades para o componente PriceTrendsWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface PriceTrendsWidgetProps {
  selectedPeriod: string;
}

/**
 * @function PriceTrendsWidget
 * @description Componente de widget que exibe as tendências de preços em um gráfico de linha.
 * @param {PriceTrendsWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente PriceTrendsWidget.
 */
const PriceTrendsWidget: React.FC<PriceTrendsWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data, isLoading, isError, error } = useQuery<PriceTrendData[], Error>({
    queryKey: ['priceTrends', token, selectedPeriod],
    queryFn: () => fetchPriceTrends(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar tendências de preços: ${error.message}`, 'error');
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
        <FaChartLine style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhum dado de tendência de preços disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Monitore seus produtos para ver as tendências de preços.
        </Typography>
      </Box>
    );
  }

  // Prepara os dados para o ApexCharts
  const chartSeries = [{
    name: 'Preço',
    data: data.map(item => item.price)
  }];
  const chartOptions = {
    chart: {
      type: 'line' as 'line',
      height: 350,
      foreColor: 'inherit',
    },
    xaxis: {
      categories: data.map(item => new Date(item.date).toLocaleDateString('pt-BR')),
      labels: {
        style: {
          colors: 'inherit',
        }
      }
    },
    yaxis: {
      title: {
        text: 'Preço (R$)',
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

export default PriceTrendsWidget;
