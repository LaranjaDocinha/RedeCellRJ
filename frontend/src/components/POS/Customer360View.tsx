import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Customer360ViewData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
  store_credit_balance: number;
  loyalty_points: number; // Added loyalty_points
  recent_sales: Array<{
    id: string;
    total_amount: string;
    sale_date: string; // Changed to string as it comes from API
  }>;
}

interface Customer360ViewProps {
  customerId: string;
}

const fetchCustomer360View = async (customerId: string): Promise<Customer360ViewData> => {
  const response = await axios.get(`/api/customers/${customerId}/360view`);
  return response.data;
};

const Customer360View: React.FC<Customer360ViewProps> = ({ customerId }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery<Customer360ViewData, Error>(
    ['customer360View', customerId],
    () => fetchCustomer360View(customerId),
    {
      enabled: !!customerId, // Only fetch when customerId is available
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {t('error_loading_customer_data', { message: error.message })}
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography sx={{ p: 2 }}>{t('no_customer_data_available')}</Typography>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {t('customer_360_view')}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">{t('customer_details')}</Typography>
        <Typography><strong>{t('name')}:</strong> {data.name}</Typography>
        <Typography><strong>{t('email')}:</strong> {data.email}</Typography>
        {data.phone && <Typography><strong>{t('phone')}:</strong> {data.phone}</Typography>}
        {data.address && <Typography><strong>{t('address')}:</strong> {data.address}</Typography>}
        {data.cpf && <Typography><strong>{t('cpf')}:</strong> {data.cpf}</Typography>}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">{t('financial_info')}</Typography>
        <Typography><strong>{t('store_credit_balance')}:</strong> R$ {data.store_credit_balance.toFixed(2)}</Typography>
        <Typography><strong>{t('loyalty_points')}:</strong> {data.loyalty_points.toFixed(0)}</Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box>
        <Typography variant="subtitle1">{t('recent_sales')}</Typography>
        {data.recent_sales && data.recent_sales.length > 0 ? (
          <List dense>
            {data.recent_sales.map((sale) => (
              <ListItem key={sale.id}>
                <ListItemText
                  primary={`${t('sale_id')}: ${sale.id}`}
                  secondary={`${t('date')}: ${format(new Date(sale.sale_date), 'dd/MM/yyyy HH:mm')} - ${t('total')}: R$ ${parseFloat(sale.total_amount).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>{t('no_recent_sales')}</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Customer360View;
