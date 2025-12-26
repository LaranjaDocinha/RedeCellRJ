import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaStore } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface SalesByChannelData
 * @description Define a estrutura dos dados de vendas por canal.
 * @property {string} channel - O nome do canal de vendas.
 * @property {number} totalSales - O total de vendas para o canal.
 */
interface SalesByChannelData {
  channel: string;
  totalSales: number;
}

/**
 * @function fetchSalesByChannel
 * @description Função assíncrona para buscar os dados de vendas por canal.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<SalesByChannelData[]>} Uma promessa que resolve com os dados de vendas por canal.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchSalesByChannel = async (token: string, selectedPeriod: string): Promise<SalesByChannelData[]> => {
  const response = await fetch(`/api/sales-by-channel?period=${selectedPeriod}`, {
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
 * @interface SalesByChannelWidgetProps
 * @description Propriedades para o componente SalesByChannelWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface SalesByChannelWidgetProps {
  selectedPeriod: string;
}

/**
 * @function SalesByChannelWidget
 * @description Componente de widget que exibe a distribuição de vendas por canal em um gráfico de pizza.
 * @param {SalesByChannelWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente SalesByChannelWidget.
 */
const SalesByChannelWidget: React.FC<SalesByChannelWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const { data, isLoading, isError, error } = useQuery<SalesByChannelData[], Error>({
    queryKey: ['salesByChannel', token, selectedPeriod],
    queryFn: () => fetchSalesByChannel(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      showNotification(`Falha ao buscar vendas por canal: ${error.message}`, 'error');
    }
  }, [isError, error, showNotification]);

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
        <FaStore style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhum dado de vendas por canal disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Registre vendas para ver a distribuição por canal.
        </Typography>
      </Box>
    );
  }

  // Prepara os dados para o ApexCharts
  const chartSeries = data.map(item => item.totalSales);
  const chartOptions = {
    labels: data.map(item => item.channel),
    chart: {
      type: 'donut' as 'donut',
      foreColor: 'inherit',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    legend: {
        position: 'bottom' as 'bottom',
        labels: {
            colors: 'inherit',
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
      <Chart options={chartOptions} series={chartSeries} type="donut" height={300} />
    </motion.div>
  );
});

export default SalesByChannelWidget;
