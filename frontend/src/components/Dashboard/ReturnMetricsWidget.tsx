import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaUndo } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface ReturnMetricsData
 * @description Define a estrutura dos dados de métricas de devolução.
 * @property {number} totalReturns - O número total de devoluções.
 * @property {number} totalReturnAmount - O valor total das devoluções.
 * @property {number} returnRate - A taxa de devolução (%).
 */
interface ReturnMetricsData {
  totalReturns: number;
  totalReturnAmount: number;
  returnRate: number;
}

/**
 * @function fetchReturnMetrics
 * @description Função assíncrona para buscar os dados de métricas de devolução.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<ReturnMetricsData>} Uma promessa que resolve com os dados de métricas de devolução.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchReturnMetrics = async (token: string, selectedPeriod: string): Promise<ReturnMetricsData> => {
  const response = await fetch(`/api/return-metrics?period=${selectedPeriod}`, {
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
 * @interface ReturnMetricsWidgetProps
 * @description Propriedades para o componente ReturnMetricsWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface ReturnMetricsWidgetProps {
  selectedPeriod: string;
}

/**
 * @function ReturnMetricsWidget
 * @description Componente de widget que exibe métricas de devolução.
 * @param {ReturnMetricsWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente ReturnMetricsWidget.
 */
const ReturnMetricsWidget: React.FC<ReturnMetricsWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const { data, isLoading, isError, error } = useQuery<ReturnMetricsData, Error>({
    queryKey: ['returnMetrics', token, selectedPeriod],
    queryFn: () => fetchReturnMetrics(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      showNotification(`Falha ao buscar métricas de devolução: ${error.message}`, 'error');
    }
  }, [isError, error, showNotification]);

  if (isLoading) {
    return <DashboardWidgetSkeleton />;
  }

  if (!data || (data.totalReturns === 0 && data.totalReturnAmount === 0 && data.returnRate === 0)) {
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
        <FaUndo style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight={400}>Nenhum dado de devolução disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Monitore suas devoluções aqui.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" component="div" sx={{ fontWeight: 400, mb: 1 }}>
        {data.totalReturns} Devoluções
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Valor Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalReturnAmount)}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Taxa de Devolução: {data.returnRate.toFixed(2)}%
      </Typography>
    </Box>
  );
});

export default ReturnMetricsWidget;


