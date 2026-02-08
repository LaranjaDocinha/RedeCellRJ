import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaClock } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface RevenueByHourData
 * @description Define a estrutura dos dados de receita por hora do dia.
 * @property {string} hour - A hora do dia (e.g., "09:00").
 * @property {number} totalRevenue - A receita total para aquela hora.
 */
interface RevenueByHourData {
  hour: string;
  totalRevenue: number;
}

/**
 * @function fetchRevenueByHour
 * @description Função assíncrona para buscar os dados de receita por hora do dia.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<RevenueByHourData[]>} Uma promessa que resolve com os dados de receita por hora.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchRevenueByHour = async (token: string, selectedPeriod: string): Promise<RevenueByHourData[]> => {
  const response = await fetch(`/api/revenue-by-hour?period=${selectedPeriod}`, {
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
 * @interface RevenueByHourWidgetProps
 * @description Propriedades para o componente RevenueByHourWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface RevenueByHourWidgetProps {
  selectedPeriod: string;
}

/**
 * @function RevenueByHourWidget
 * @description Componente de widget que exibe a receita por hora do dia em um gráfico de barras.
 * @param {RevenueByHourWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente RevenueByHourWidget.
 */
const RevenueByHourWidget: React.FC<RevenueByHourWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const { data, isLoading, isError, error } = useQuery<RevenueByHourData[], Error>({
    queryKey: ['revenueByHour', token, selectedPeriod],
    queryFn: () => fetchRevenueByHour(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      showNotification(`Falha ao buscar receita por hora: ${error.message}`, 'error');
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
        <FaClock style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight={400}>Nenhum dado de receita por hora disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Registre vendas para ver a receita por hora do dia.
        </Typography>
      </Box>
    );
  }

  // Prepara os dados para o ApexCharts
  const chartSeries = [{
    name: 'Receita',
    data: data.map(item => item.totalRevenue)
  }];
  const chartOptions = {
    chart: {
      type: 'bar' as 'bar',
      height: 350,
      foreColor: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: data.map(item => item.hour),
      labels: {
        style: {
          colors: 'inherit',
        }
      }
    },
    yaxis: {
      title: {
        text: 'Receita (R$)',
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
    fill: {
      opacity: 1
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
      <Chart options={chartOptions} series={chartSeries} type="bar" height={300} />
    </motion.div>
  );
});

export default RevenueByHourWidget;

