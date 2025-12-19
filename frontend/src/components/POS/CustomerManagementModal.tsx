import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
}

interface CustomerManagementModalProps {
  open: boolean;
  onClose: () => void;
  onCustomerSelect: (customer: Customer) => void;
}

const createCustomerSchema = z.object({
  name: z.string().trim().nonempty('Nome é obrigatório'),
  email: z.string().email('Formato de e-mail inválido').nonempty('E-mail é obrigatório'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Formato de CPF inválido').optional().nullable(),
  birth_date: z.string().datetime().optional().nullable(),
});

type CreateCustomerFormInputs = z.infer<typeof createCustomerSchema>;

const fetchCustomers = async (searchTerm: string, page: number, limit: number) => {
  const response = await axios.get('/api/customers/search', {
    params: { searchTerm, limit, offset: (page - 1) * limit },
  });
  return response.data;
};

const createCustomer = async (data: CreateCustomerFormInputs) => {
  const response = await axios.post('/api/customers', data);
  return response.data;
};

const CustomerManagementModal: React.FC<CustomerManagementModalProps> = ({ open, onClose, onCustomerSelect }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<{ customers: Customer[]; totalCustomers: number }>(
    ['customersSearch', searchTerm, page],
    () => fetchCustomers(searchTerm, page, 10),
    {
      enabled: open,
      keepPreviousData: true,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCustomerFormInputs>({
    resolver: zodResolver(createCustomerSchema),
  });

  const createCustomerMutation = useMutation(createCustomer, {
    onSuccess: (newCustomer) => {
      addNotification(t('customer_created_success', { name: newCustomer.name }), 'success');
      queryClient.invalidateQueries(['customersSearch']);
      onCustomerSelect(newCustomer);
      reset();
      setIsCreatingNewCustomer(false);
      onClose();
    },
    onError: (err: any) => {
      addNotification(t('customer_created_error', { message: err.response?.data?.message || err.message }), 'error');
    },
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset page when search term changes
  };

  const handleSelectCustomer = (customer: Customer) => {
    onCustomerSelect(customer);
    onClose();
  };

  const onSubmitNewCustomer = (data: CreateCustomerFormInputs) => {
    createCustomerMutation.mutate(data);
  };

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setPage(1);
      setIsCreatingNewCustomer(false);
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isCreatingNewCustomer ? t('create_new_customer') : t('manage_customers')}
      </DialogTitle>
      <DialogContent dividers>
        {!isCreatingNewCustomer ? (
          <Box>
            <TextField
              fullWidth
              label={t('search_customer_placeholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setIsCreatingNewCustomer(true)} color="primary">
                      <PersonAddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {isLoading && <CircularProgress size={20} sx={{ display: 'block', mx: 'auto', my: 2 }} />}
            {error && <Typography color="error">{t('customer_search_error', { message: error.message })}</Typography>}

            {data && data.customers.length > 0 ? (
              <List>
                {data.customers.map((customer) => (
                  <React.Fragment key={customer.id}>
                    <ListItem button onClick={() => handleSelectCustomer(customer)}>
                      <ListItemText
                        primary={customer.name}
                        secondary={`${customer.email} ${customer.phone ? `(${customer.phone})` : ''}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              !isLoading && searchTerm && <Typography sx={{ mt: 2 }}>{t('no_customers_found')}</Typography>
            )}

            {data && data.totalCustomers > 10 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1}>
                  {t('previous')}
                </Button>
                <Typography sx={{ mx: 2 }}>{t('page_x_of_y', { page, totalPages: Math.ceil(data.totalCustomers / 10) })}</Typography>
                <Button onClick={() => setPage(prev => prev + 1)} disabled={page * 10 >= data.totalCustomers}>
                  {t('next')}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmitNewCustomer)} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t('customer_name')}
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('customer_email')}
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('customer_phone')}
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('customer_address')}
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('customer_cpf')}
              {...register('cpf')}
              error={!!errors.cpf}
              helperText={errors.cpf?.message}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('customer_birth_date')}
              type="date"
              {...register('birth_date')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.birth_date}
              helperText={errors.birth_date?.message}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={createCustomerMutation.isLoading}>
              {createCustomerMutation.isLoading ? <CircularProgress size={24} /> : t('create_customer')}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsCreatingNewCustomer(false)}
              sx={{ mt: 1 }}
            >
              {t('cancel')}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerManagementModal;
