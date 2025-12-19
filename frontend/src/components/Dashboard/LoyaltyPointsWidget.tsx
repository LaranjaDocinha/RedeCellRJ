import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useQuery } from '@tanstack/react-query';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { Typography, Box } from '@mui/material';

/**
 * @interface LoyaltyPointsWidgetProps
 * @description Propriedades para o componente LoyaltyPointsWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface LoyaltyPointsWidgetProps {
  selectedPeriod: string;
}

/**
 * @interface LoyaltyPointsData
 * @description Define a estrutura dos dados de pontos de fidelidade.
 * @property {number} loyalty_points - O número de pontos de fidelidade.
 */
interface LoyaltyPointsData {
  loyalty_points: number;
}

/**
 * @function fetchLoyaltyPoints
 * @description Função assíncrona para buscar os dados de pontos de fidelidade.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<LoyaltyPointsData>} Uma promessa que resolve com os dados de pontos de fidelidade.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchLoyaltyPoints = async (token: string, selectedPeriod: string): Promise<LoyaltyPointsData> => {
  const response = await fetch(`/api/loyalty/points?period=${selectedPeriod}`, {
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
 * @function LoyaltyPointsWidget
 * @description Componente de widget que exibe os pontos de fidelidade do usuário.
 * @param {LoyaltyPointsWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente LoyaltyPointsWidget.
 */
const LoyaltyPointsWidget: React.FC<LoyaltyPointsWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data, isLoading, isError, error } = useQuery<LoyaltyPointsData, Error>({
    queryKey: ['loyaltyPoints', token, selectedPeriod],
    queryFn: () => fetchLoyaltyPoints(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar pontos de fidelidade: ${error.message}`, 'error');
    }
  }, [isError, error, addToast]);

  if (isLoading) {
    return <DashboardWidgetSkeleton />;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
      {data?.loyalty_points !== undefined ? (
        <Typography variant="h3" component="p" color="primary" fontWeight="bold">
          {data.loyalty_points}
        </Typography>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Nenhum ponto de fidelidade disponível.
        </Typography>
      )}
    </Box>
  );
});

export default LoyaltyPointsWidget;
