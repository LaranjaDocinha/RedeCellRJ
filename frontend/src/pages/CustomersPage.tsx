import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Box, Typography, Button, IconButton, Tooltip, Chip, 
  LinearProgress, alpha, useTheme, Avatar, Paper,
  Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { 
  DataGrid, GridColDef, GridToolbarContainer, 
  GridToolbarExport, GridToolbarColumnsButton, GridToolbarFilterButton 
} from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Visibility as ViewIcon, 
  Edit as EditIcon, 
  WhatsApp as WhatsAppIcon, 
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigation } from 'react-router-dom';
import { CustomerForm } from '../components/CustomerForm';

const CustomersPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { addNotification } = useNotification();
  const navigation = useNavigation();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data || response.data || []);
    } catch (error) {
      addNotification('Erro ao carregar clientes.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const handleCreateCustomer = async (data: any) => {
    try {
      setLoading(true);
      await api.post('/customers', data);
      addNotification('Cliente cadastrado com sucesso!', 'success');
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Erro ao cadastrar cliente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={2} height="100%">
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: '0.8rem' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'E-mail',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'WhatsApp',
      width: 160,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <WhatsAppIcon sx={{ color: '#25D366', fontSize: 18 }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'health_score',
      headerName: 'Saúde',
      width: 150,
      renderCell: (params) => {
        const score = params.value || 0;
        const color = score > 70 ? 'success' : score > 40 ? 'warning' : 'error';
        return (
          <Box width="100%" display="flex" alignItems="center" gap={1}>
            <LinearProgress 
              variant="determinate" 
              value={score} 
              color={color} 
              sx={{ width: 50, height: 6, borderRadius: 3 }} 
            />
            <Typography variant="caption">{score}%</Typography>
          </Box>
        );
      }
    },
    {
      field: 'loyalty_points',
      headerName: 'Pontos',
      width: 100,
      renderCell: (params) => <Chip label={params.value || 0} size="small" color="secondary" variant="outlined" />
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <IconButton size="small" onClick={() => { setSelectedCustomer(params.row); setIsDrawerOpen(true); }}>
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 400 }}>Gestão de Clientes</Typography>
        <Box display="flex" gap={2}>
          <Button startIcon={<RefreshIcon />} onClick={fetchCustomers} variant="outlined" sx={{ borderRadius: '12px' }}>
            Atualizar
          </Button>
          <Button 
            startIcon={<AddIcon />} 
            variant="contained" 
            onClick={() => setIsModalOpen(true)}
            sx={{ borderRadius: '12px' }}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid ' + theme.palette.divider }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={loading || navigation.state === 'loading'}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
          slots={{
            toolbar: () => (
              <GridToolbarContainer sx={{ p: 2, borderBottom: '1px solid ' + theme.palette.divider }}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarExport />
              </GridToolbarContainer>
            )
          }}
        />
      </Paper>

      {/* Modal de Novo Cliente */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '28px', p: 1, backgroundImage: 'none' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="span" sx={{ fontWeight: 400 }}>Cadastrar Novo Cliente</Typography>
          <IconButton onClick={() => setIsModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <CustomerForm 
              onSubmit={handleCreateCustomer} 
              onCancel={() => setIsModalOpen(false)} 
              loading={loading}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CustomersPage;