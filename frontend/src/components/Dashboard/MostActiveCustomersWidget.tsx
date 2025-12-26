import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { Box, Typography, List, ListItem, ListItemText, Avatar, ListItemAvatar, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { FaUserCircle } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface CustomerData
 * @description Define a estrutura dos dados de um cliente ativo.
 * @property {number} id - O ID do cliente.
 * @property {string} name - O nome do cliente.
 * @property {number} totalPurchases - O total de compras do cliente.
 * @property {number} purchaseCount - O número de compras do cliente.
 */
interface CustomerData {
  id: number;
  name: string;
  totalPurchases: number;
  purchaseCount: number;
}

/**
 * @function fetchMostActiveCustomers
 * @description Função assíncrona para buscar os dados dos clientes mais ativos.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<CustomerData[]>} Uma promessa que resolve com os dados dos clientes mais ativos.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchMostActiveCustomers = async (token: string, selectedPeriod: string): Promise<CustomerData[]> => {
  const response = await fetch(`/api/most-active-customers?period=${selectedPeriod}`, {
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
 * @interface MostActiveCustomersWidgetProps
 * @description Propriedades para o componente MostActiveCustomersWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface MostActiveCustomersWidgetProps {
  selectedPeriod: string;
}

/**
 * @function MostActiveCustomersWidget
 * @description Componente de widget que exibe uma lista dos clientes mais ativos.
 * @param {MostActiveCustomersWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente MostActiveCustomersWidget.
 */
const MostActiveCustomersWidget: React.FC<MostActiveCustomersWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const { data, isLoading, isError, error } = useQuery<CustomerData[], Error>({
    queryKey: ['mostActiveCustomers', token, selectedPeriod],
    queryFn: () => fetchMostActiveCustomers(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      showNotification(`Falha ao buscar clientes mais ativos: ${error.message}`, 'error');
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
        <FaUserCircle style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhum cliente ativo encontrado.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Incentive seus clientes a comprar mais!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
      {data.map((customer, index) => (
        <motion.div
          key={customer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                {customer.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {customer.name}
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Compras: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.totalPurchases)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nº de Compras: {customer.purchaseCount}
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

export default MostActiveCustomersWidget;
