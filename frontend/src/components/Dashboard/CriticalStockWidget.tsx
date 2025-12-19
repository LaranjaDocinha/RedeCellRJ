import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface CriticalStockData
 * @description Define a estrutura dos dados de produtos com estoque crítico.
 * @property {number} id - O ID do produto.
 * @property {string} name - O nome do produto.
 * @property {number} currentStock - A quantidade atual em estoque.
 * @property {number} criticalLimit - O limite crítico de estoque.
 */
interface CriticalStockData {
  id: number;
  name: string;
  currentStock: number;
  criticalLimit: number;
}

/**
 * @function fetchCriticalStock
 * @description Função assíncrona para buscar os dados de produtos com estoque crítico.
 * @param {string} token - Token de autenticação do usuário.
 * @returns {Promise<CriticalStockData[]>} Uma promessa que resolve com os dados de produtos com estoque crítico.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchCriticalStock = async (token: string): Promise<CriticalStockData[]> => {
  const response = await fetch(`/api/critical-stock`, {
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
 * @interface CriticalStockWidgetProps
 * @description Propriedades para o componente CriticalStockWidget.
 */
interface CriticalStockWidgetProps {
  // No selectedPeriod prop as it's for critical stock
}

/**
 * @function CriticalStockWidget
 * @description Componente de widget que exibe uma lista de produtos com estoque crítico.
 * @param {CriticalStockWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente CriticalStockWidget.
 */
const CriticalStockWidget: React.FC<CriticalStockWidgetProps> = React.memo(() => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data, isLoading, isError, error } = useQuery<CriticalStockData[], Error>({
    queryKey: ['criticalStock', token],
    queryFn: () => fetchCriticalStock(token!),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar produtos com estoque crítico: ${error.message}`, 'error');
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
        <FaExclamationTriangle style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhum produto com estoque crítico.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Seu estoque está em ordem!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
      {data.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {product.name}
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Estoque: {product.currentStock} (Limite Crítico: {product.criticalLimit})
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < data.length - 1 && <Divider component="li" />}
        </motion.div>
      ))}
    </List>
  );
});

export default CriticalStockWidget;
