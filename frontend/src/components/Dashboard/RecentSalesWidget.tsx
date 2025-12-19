import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useQuery } from '@tanstack/react-query';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';
import { List, ListItem, ListItemText, Typography, Divider, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa'; // Icon for empty state

/**
 * @interface RecentSalesWidgetProps
 * @description Propriedades para o componente RecentSalesWidget.
 * @property {string} selectedPeriod - O período selecionado para filtrar os dados.
 */
interface RecentSalesWidgetProps {
  selectedPeriod: string;
}

/**
 * @interface Sale
 * @description Define a estrutura de um objeto de venda.
 * @property {number} id - O ID da venda.
 * @property {number} total_amount - O valor total da venda.
 * @property {string} sale_date - A data da venda.
 * @property {string} [customer_name] - Nome do cliente (opcional).
 * @property {string} [status] - Status da venda (opcional).
 */
interface Sale {
  id: number;
  total_amount: number;
  sale_date: string;
  customer_name?: string;
  status?: string;
}

/**
 * @function fetchRecentSales
 * @description Função assíncrona para buscar os dados de vendas recentes.
 * @param {string} token - Token de autenticação do usuário.
 * @param {string} selectedPeriod - O período selecionado para a busca.
 * @returns {Promise<Sale[]>} Uma promessa que resolve com uma lista de vendas recentes.
 * @throws {Error} Se a requisição HTTP falhar.
 */
const fetchRecentSales = async (token: string, selectedPeriod: string): Promise<Sale[]> => {
  const response = await fetch(`/api/sales?period=${selectedPeriod}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: Sale[] = await response.json();
  // For demonstration, adding dummy customer_name and status
  return data.map(sale => ({
    ...sale,
    customer_name: `Cliente ${sale.id}`,
    status: sale.id % 2 === 0 ? 'Concluída' : 'Pendente',
  }));
};

/**
 * @function RecentSalesWidget
 * @description Componente de widget que exibe uma lista das vendas mais recentes.
 * @param {RecentSalesWidgetProps} props - As propriedades do componente.
 * @returns {React.FC} O componente RecentSalesWidget.
 */
const RecentSalesWidget: React.FC<RecentSalesWidgetProps> = React.memo(({ selectedPeriod }) => {
  const { token, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const { data: recentSales, isLoading, isError, error } = useQuery<Sale[], Error>({
    queryKey: ['recentSales', token, selectedPeriod],
    queryFn: () => fetchRecentSales(token!, selectedPeriod),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isError && error) {
      addToast(`Falha ao buscar vendas recentes: ${error.message}`, 'error');
    }
  }, [isError, error, addToast]);

  if (isLoading) {
    return <DashboardWidgetSkeleton />;
  }

  const handleSaleClick = (saleId: number) => {
    addToast(`Detalhes da Venda #${saleId} (funcionalidade a ser implementada)`, 'info');
    // Implement navigation to sale detail page or open a modal
  };

  if (recentSales && recentSales.length === 0) {
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
        <FaShoppingCart style={{ fontSize: '4rem', marginBottom: '1rem' }} />
        <Typography variant="body1" fontWeight="bold">Nenhuma venda recente encontrada.</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Comece a registrar vendas para ver a atividade aqui.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
      {recentSales?.map((sale, index) => (
        <motion.div
          key={sale.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ListItem button onClick={() => handleSaleClick(sale.id)}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
                    Venda #{sale.id}
                  </Typography>
                  <Typography variant="body1" component="span" color="primary" sx={{ fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cliente: {sale.customer_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {sale.status || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < recentSales.length - 1 && <Divider component="li" />}
        </motion.div>
      ))}
    </List>
  );
});

export default RecentSalesWidget;