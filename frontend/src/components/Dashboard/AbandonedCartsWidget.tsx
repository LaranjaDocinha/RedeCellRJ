import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa'; // Reusing shopping cart icon for abandoned carts

/**
 * @interface AbandonedCartsData
 * @description Define a estrutura dos dados de carrinhos abandonados.
 * @property {number} totalAbandonedCarts - O número total de carrinhos abandonados.
 * @property {number} totalAbandonedAmount - O valor total dos carrinhos abandonados.
 * @property {number} recoveryRate - A taxa de recuperação de carrinhos abandonados (%).
 */
interface AbandonedCartsData {
  totalAbandonedCarts: number;
  totalAbandonedAmount: number;
  recoveryRate: number;
}

/**
 * @function fetchAbandonedCarts
 * @description Função assíncrona para buscar os dados de carrinhos abandonados.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<AbandonedCartsData>} Uma promessa que resolve com os dados de carrinhos abandonados.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchAbandonedCarts = async (token: string, selectedPeriod: string): Promise<AbandonedCartsData> => {
  const response = await fetch(`/api/abandoned-carts?period=${selectedPeriod}`, {
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
 * @interface AbandonedCartsWidgetProps
 * @description Propriedades para o componente AbandonedCartsWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface AbandonedCartsWidgetProps {
  selectedPeriod: string;
}

/**
 * @function AbandonedCartsWidget
 * @description Componente de widget que exibe métricas de carrinhos abandonados.
 * @param {AbandonedCartsWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente AbandonedCartsWidget.
 */
const AbandonedCartsWidget: React.FC<AbandonedCartsWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data, isLoading, isError, error } = useQuery<AbandonedCartsData, Error>({
    queryKey: ['abandonedCarts', token, selectedPeriod],
    queryFn: () => fetchAbandonedCarts(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar métricas de carrinhos abandonados: ${error.message}`, 'error');
    }
  }, [isError, error, addToast]);

  if (isLoading) {
    return <DashboardWidgetSkeleton />;
  }

  if (!data || (data.totalAbandonedCarts === 0 && data.totalAbandonedAmount === 0 && data.recoveryRate === 0)) {
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
        <FaShoppingCart style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhum carrinho abandonado encontrado.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Otimize seu checkout para reduzir abandonos!
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
      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
        {data.totalAbandonedCarts} Carrinhos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Valor Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalAbandonedAmount)}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Taxa de Recuperação: {data.recoveryRate.toFixed(2)}%
      </Typography>
    </Box>
  );
});

export default AbandonedCartsWidget;
