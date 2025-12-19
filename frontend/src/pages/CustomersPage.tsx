import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  TextField, 
  InputAdornment, 
  Dialog, 
  DialogContent, 
  DialogTitle,
  useTheme,
  Tooltip,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams, 
  GridToolbar,
  ptBR
} from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { CustomerForm } from '../components/CustomerForm';
import Loading from '../components/Loading'; // Keeping original loading for initial state if needed

// Motion components
const MotionContainer = motion(Container);
const MotionCard = motion(Card);

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  cpf?: string;
  birth_date?: string;
  rfm_recency?: number;
  rfm_frequency?: number;
  rfm_monetary?: number;
  rfm_segment?: string;
  loyalty_points?: number;
  loyalty_tier_id?: number;
  created_at?: string; // Assuming this field exists or we can infer
}

const CustomersPage: React.FC = () => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { token } = useAuth();
  const { addToast } = useNotification();

  // Stats calculation
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.rfm_segment !== 'Lost').length; // Example logic
    const vip = customers.filter(c => (c.loyalty_points || 0) > 100).length; // Example logic
    return { total, active, vip };
  }, [customers]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error: any) {
      console.error("Falha ao buscar clientes:", error);
      addToast(`Falha ao buscar clientes: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (customerData: any) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setIsModalOpen(false);
      fetchCustomers();
      addToast('Cliente criado com sucesso!', 'success');
    } catch (error: any) {
      console.error("Falha ao criar cliente:", error);
      addToast(`Falha ao criar cliente: ${error.message}`, 'error');
    }
  };

  const handleUpdateCustomer = async (id: number, customerData: any) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingCustomer(undefined);
      setIsModalOpen(false);
      fetchCustomers();
      addToast('Cliente atualizado com sucesso!', 'success');
    } catch (error: any) {
      console.error("Falha ao atualizar cliente:", error);
      addToast(`Falha ao atualizar cliente: ${error.message}`, 'error');
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Você tem certeza que deseja excluir este cliente?')) return;
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchCustomers();
      addToast('Cliente excluído com sucesso!', 'success');
    } catch (error: any) {
      console.error("Falha ao excluir cliente:", error);
      addToast(`Falha ao excluir cliente: ${error.message}`, 'error');
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCustomer(undefined);
    setIsModalOpen(false);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (c.phone && c.phone.includes(searchText))
    );
  }, [customers, searchText]);

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
      renderCell: (params) => <Typography variant="body2" color="textSecondary">#{params.value}</Typography>
    },
    { 
      field: 'name', 
      headerName: 'Cliente', 
      flex: 1, 
      minWidth: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{params.value.charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">{params.value}</Typography>
            <Typography variant="caption" color="textSecondary">{params.row.email}</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'phone', 
      headerName: 'Telefone', 
      width: 150,
      renderCell: (params) => params.value || '-'
    },
    { 
      field: 'loyalty_points', 
      headerName: 'Pontos Fidelidade', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          icon={<StarIcon fontSize="small" />} 
          label={params.value || 0} 
          size="small" 
          color="secondary" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'rfm_segment', 
      headerName: 'Segmento', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Novo'} 
          size="small" 
          color={params.value === 'Champion' ? 'success' : 'default'} 
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" color="primary" onClick={() => handleOpenModal(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" color="error" onClick={() => handleDeleteCustomer(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MotionContainer 
      maxWidth="xl" 
      sx={{ py: 4 }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} component={motion.div} variants={itemVariants}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Clientes
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gerencie sua base de clientes e programas de fidelidade.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          size="large"
          onClick={() => handleOpenModal()}
          sx={{ borderRadius: 2, px: 4, boxShadow: 4 }}
        >
          Novo Cliente
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4} component={motion.div} variants={itemVariants}>
        <Grid item xs={12} md={4}>
          <MotionCard elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }} whileHover={{ y: -5 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Total de Clientes</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 56, height: 56 }}>
                  <PeopleIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MotionCard elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }} whileHover={{ y: -5 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Clientes Ativos</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.active}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 56, height: 56 }}>
                  <TrendingUpIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MotionCard elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }} whileHover={{ y: -5 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Clientes VIP</Typography>
                  <Typography variant="h4" fontWeight="bold">{stats.vip}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 56, height: 56 }}>
                  <StarIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Search & Filter */}
      <Box mb={3} component={motion.div} variants={itemVariants}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome, email ou telefone..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
        />
      </Box>

      {/* Data Grid */}
      <Box component={motion.div} variants={itemVariants} sx={{ height: 600, width: '100%' }}>
        <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <DataGrid
            rows={filteredCustomers}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.grey[50],
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
            }}
          />
        </Card>
      </Box>

      {/* Modal Form */}
      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
          style: { borderRadius: 16 }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {editingCustomer ? <EditIcon color="primary" /> : <PersonAddIcon color="primary" />}
            <Typography variant="h6" fontWeight="bold">
              {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box pt={1}>
            <CustomerForm
              initialData={editingCustomer}
              onSubmit={(data) => {
                if (editingCustomer) {
                  handleUpdateCustomer(editingCustomer.id, data);
                } else {
                  handleCreateCustomer(data);
                }
              }}
              onCancel={handleCloseModal}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </MotionContainer>
  );
};

export default CustomersPage;