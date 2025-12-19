import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { motion } from 'framer-motion';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useEffect } from 'react';

/**
 * @interface SalesGoalsData
 * @description Define a estrutura dos dados de metas de vendas.
 * @property {number} currentSales - O valor das vendas atuais.
 * @property {number} goal - A meta de vendas.
 */
interface SalesGoalsData {
  currentSales: number;
  goal: number;
}

/**
 * @function fetchSalesGoals
 * @description Função assíncrona para buscar os dados de metas de vendas.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<SalesGoalsData>} Uma promessa que resolve com os dados de metas de vendas.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchSalesGoals = async (token: string, selectedPeriod: string): Promise<SalesGoalsData> => {
  const response = await fetch(`/api/sales-goals?period=${selectedPeriod}`, {
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
 * @interface SalesGoalsWidgetProps
 * @description Propriedades para o componente SalesGoalsWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface SalesGoalsWidgetProps {
  selectedPeriod: string;
}

/**
 * @function SalesGoalsWidget
 * @description Componente de widget que exibe as metas de vendas e o progresso atual.
 * @param {SalesGoalsWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente SalesGoalsWidget.
 */
const SalesGoalsWidget: React.FC<SalesGoalsWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data, isLoading, isError, error } = useQuery<SalesGoalsData, Error>({
    queryKey: ['salesGoals', token, selectedPeriod],
    queryFn: () => fetchSalesGoals(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar metas de vendas: ${error.message}`, 'error');
    }
  }, [isError, error, addToast]);

  if (isLoading) {
    return <DashboardWidgetSkeleton />;
  }

  if (!data || data.goal === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          color: (theme) => theme.palette.text.secondary,
        }}
      >
        <Typography variant="body1" fontWeight="bold">Nenhuma meta de vendas definida ou disponível.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Defina suas metas para acompanhar o progresso.
        </Typography>
      </Box>
    );
  }

  const rawProgress = data.goal > 0 ? (data.currentSales / data.goal) * 100 : 0;
  const progress = isNaN(rawProgress) ? 0 : rawProgress;
  const progressColor = progress >= 100 ? 'success' : progress >= 75 ? 'warning' : 'error';

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
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.goal)}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Meta de Vendas
      </Typography>

      <Box sx={{ width: '80%', mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)} // Cap progress at 100% for visual
          color={progressColor}
          sx={{ height: 10, borderRadius: 5 }}
          aria-label="Progresso da meta de vendas"
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        Vendas Atuais: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.currentSales)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Progresso: {progress.toFixed(2)}%
      </Typography>
    </Box>
  );
});

export default SalesGoalsWidget;
