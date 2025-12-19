import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import Chart from 'react-apexcharts';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * @interface CategoryProfitabilityData
 * @description Define a estrutura dos dados de rentabilidade por categoria.
 * @property {string} category - O nome da categoria.
 * @property {number} profitability - O valor da rentabilidade da categoria.
 */
interface CategoryProfitabilityData {
  category: string;
  profitability: number;
}

/**
 * @function fetchCategoryProfitability
 * @description Função assíncrona para buscar os dados de rentabilidade por categoria.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<CategoryProfitabilityData[]>} Uma promessa que resolve com os dados de rentabilidade por categoria.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchCategoryProfitability = async (token: string, selectedPeriod: string): Promise<CategoryProfitabilityData[]> => {
  const response = await fetch(`/api/category-profitability?period=${selectedPeriod}`, {
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
 * @interface CategoryProfitabilityWidgetProps
 * @description Propriedades para o componente CategoryProfitabilityWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface CategoryProfitabilityWidgetProps {
  selectedPeriod: string;
}

/**
 * @function CategoryProfitabilityWidget
 * @description Componente de widget que exibe a rentabilidade por categoria em um gráfico de pizza.
 * @param {CategoryProfitabilityWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente CategoryProfitabilityWidget.
 */
const CategoryProfitabilityWidget: React.FC<CategoryProfitabilityWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data, isLoading, isError, error } = useQuery<CategoryProfitabilityData[], Error>({
    queryKey: ['categoryProfitability', token, selectedPeriod],
    queryFn: () => fetchCategoryProfitability(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar rentabilidade por categoria: ${error.message}`, 'error');
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
        <Typography variant="body1" fontWeight="bold">Nenhum dado de rentabilidade por categoria disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Adicione produtos e registre vendas para ver a análise.
        </Typography>
      </Box>
    );
  }

  // Prepara os dados para o ApexCharts
  const chartSeries = data.map(item => item.profitability);
  const chartOptions = {
    labels: data.map(item => item.category),
    chart: {
      type: 'donut' as 'donut', // Explicitly type as 'donut'
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

export default CategoryProfitabilityWidget;
