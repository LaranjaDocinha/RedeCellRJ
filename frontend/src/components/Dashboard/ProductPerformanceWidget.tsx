import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaChartBar } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface ProductPerformanceData
 * @description Define a estrutura dos dados de desempenho de produtos.
 * @property {string} productName - O nome do produto.
 * @property {number} totalSales - O total de vendas do produto.
 * @property {number} quantitySold - A quantidade vendida do produto.
 */
interface ProductPerformanceData {
  productName: string;
  totalSales: number;
  quantitySold: number;
}

/**
 * @function fetchProductPerformance
 * @description Função assíncrona para buscar os dados de desempenho de produtos.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<ProductPerformanceData[]>} Uma promessa que resolve com os dados de desempenho de produtos.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchProductPerformance = async (token: string, selectedPeriod: string): Promise<ProductPerformanceData[]> => {
  const response = await fetch(`/api/product-performance?period=${selectedPeriod}`, {
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
 * @interface ProductPerformanceWidgetProps
 * @description Propriedades para o componente ProductPerformanceWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface ProductPerformanceWidgetProps {
  selectedPeriod: string;
}

/**
 * @function ProductPerformanceWidget
 * @description Componente de widget que exibe o desempenho de produtos em um gráfico de barras.
 * @param {ProductPerformanceWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente ProductPerformanceWidget.
 */
const ProductPerformanceWidget: React.FC<ProductPerformanceWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const { data, isLoading, isError, error } = useQuery<ProductPerformanceData[], Error>({
    queryKey: ['productPerformance', token, selectedPeriod],
    queryFn: () => fetchProductPerformance(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      showNotification(`Falha ao buscar desempenho de produtos: ${error.message}`, 'error');
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
        <FaChartBar style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhum dado de desempenho de produtos disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Registre vendas para ver o desempenho dos seus produtos.
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
      categories: data.map(item => item.productName),
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

export default ProductPerformanceWidget;
