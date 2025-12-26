import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaUsers } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface CustomerSegmentData
 * @description Define a estrutura dos dados de um segmento de cliente.
 * @property {string} segment - O nome do segmento (e.g., "Novos Clientes", "Clientes VIP").
 * @property {number} count - O número de clientes neste segmento.
 */
interface CustomerSegmentData {
  segment: string;
  count: number;
}

/**
 * @function fetchCustomerSegmentation
 * @description Função assíncrona para buscar os dados de segmentação de clientes.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<CustomerSegmentData[]>} Uma promessa que resolve com os dados de segmentação de clientes.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchCustomerSegmentation = async (token: string, selectedPeriod: string): Promise<CustomerSegmentData[]> => {
  const response = await fetch(`/api/customer-segmentation?period=${selectedPeriod}`, {
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
 * @interface CustomerSegmentationWidgetProps
 * @description Propriedades para o componente CustomerSegmentationWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface CustomerSegmentationWidgetProps {
  selectedPeriod: string;
}

/**
 * @function CustomerSegmentationWidget
 * @description Componente de widget que exibe a segmentação de clientes em um gráfico de pizza.
 * @param {CustomerSegmentationWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente CustomerSegmentationWidget.
 */
const CustomerSegmentationWidget: React.FC<CustomerSegmentationWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const { data, isLoading, isError, error } = useQuery<CustomerSegmentData[], Error>({
    queryKey: ['customerSegmentation', token, selectedPeriod],
    queryFn: () => fetchCustomerSegmentation(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      showNotification(`Falha ao buscar segmentação de clientes: ${error.message}`, 'error');
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
        <FaUsers style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhum dado de segmentação de clientes disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Analise o comportamento dos seus clientes para segmentá-los.
        </Typography>
      </Box>
    );
  }

  // Prepara os dados para o ApexCharts
  const chartSeries = data.map(item => item.count);
  const chartOptions = {
    labels: data.map(item => item.segment),
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
                return val + ' clientes';
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

export default CustomerSegmentationWidget;
