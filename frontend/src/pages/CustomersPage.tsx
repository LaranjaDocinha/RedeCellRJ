import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Card, CardContent, Grid, IconButton,
  Tooltip, Chip, Avatar, Drawer, Stack, Divider,
  Dialog, DialogContent, DialogTitle, useTheme, Menu, MenuItem,
  TextField, InputAdornment, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import {
  Add as AddIcon, Refresh, Visibility as ViewIcon, Edit as EditIcon,
  Download as ExportIcon, WhatsApp as WhatsAppIcon, Search as SearchIcon,
  People as PeopleIcon, TrendingUp as TrendingUpIcon, Star as StarIcon,
  Map as MapIcon, PersonPinCircle, FilterList as FilterIcon,
  Facebook as FacebookIcon, Google as GoogleIcon,
  Cake as BirthdayIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { CustomerForm } from '../components/CustomerForm';
import { differenceInDays } from 'date-fns';

const MotionContainer = motion.create(Container);
const MotionCard = motion.create(Card);

const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) hash = string.charCodeAt(i) + ((hash << 5) - hash);
  let color = '#';
  for (let i = 0; i < 3; i++) color += `00${((hash >> (i * 8)) & 0xff).toString(16)}`.slice(-2);
  return color;
};

const CustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { token } = useAuth();
  const { showNotification } = useNotification();
  
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [searchText, setSearchText] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } });
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (newData: any) => {
      const method = newData.id ? 'PUT' : 'POST';
      const url = newData.id ? `/api/customers/${newData.id}` : '/api/customers';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newData)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showNotification('Operação realizada com sucesso!', 'success');
      handleCloseModal();
    }
  });

  const handleOpenModal = (customer?: any) => {
    setEditingCustomer(customer || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  const monthlyBirthdays = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return customers.filter((c: any) => {
      if (!c.birth_date) return false;
      return new Date(c.birth_date).getUTCMonth() + 1 === currentMonth;
    });
  }, [customers]);

  const stats = useMemo(() => ({
    total: customers.length,
    ativos: customers.filter((c: any) => (c.loyalty_points || 0) > 0).length,
    vips: customers.filter((c: any) => (c.loyalty_points || 0) > 500).length
  }), [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c: any) => 
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (c.phone && c.phone.includes(searchText))
    );
  }, [customers, searchText]);

  const handleExport = (type: 'fb' | 'google') => {
    setExportAnchor(null);
    const headers = type === 'fb' ? 'email,phone,fn,ln' : 'Email,Phone,First Name,Last Name';
    const csvContent = customers.map((c: any) => `${c.email},${c.phone},${c.name},`).join('\n');
    const blob = new Blob([`${headers}\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `redecell_leads_${type}.csv`; a.click();
    showNotification('Exportação concluída!', 'success');
  };

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: 'Cliente', flex: 1, minWidth: 220,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={2} height="100%">
          <Avatar sx={{ bgcolor: stringToColor(params.value), fontWeight: 700 }}>{params.value[0]}</Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{params.value}</Typography>
            {params.row.last_purchase_date && differenceInDays(new Date(), new Date(params.row.last_purchase_date)) > 60 && (
              <Chip label="Inativo" size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '10px' }} />
            )}
          </Box>
        </Box>
      )
    },
    {
      field: 'phone', headerName: 'WhatsApp', width: 160,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">{params.value || '-'}</Typography>
          {params.value && <IconButton size="small" color="success" onClick={() => window.open(`https://wa.me/55${params.value.replace(/\D/g, '')}`)}><WhatsAppIcon fontSize="inherit" /></IconButton>}
        </Stack>
      )
    },
    {
      field: 'loyalty_points', headerName: 'Pontos', width: 100,
      renderCell: (params) => <Chip label={params.value || 0} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 700 }} />
    },
    {
      field: 'actions', headerName: 'Ações', width: 120, sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => { setSelectedCustomer(params.row); setIsDrawerOpen(true); }}><ViewIcon fontSize="inherit" /></IconButton>
          <IconButton size="small" color="primary" onClick={() => handleOpenModal(params.row)}><EditIcon fontSize="inherit" /></IconButton>
        </Box>
      )
    }
  ];

  return (
    <MotionContainer maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4 } }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>Clientes</Typography>
          <Typography variant="body2" color="text.secondary">Gestão inteligente e fidelização</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Card sx={{ display: { xs: 'none', lg: 'flex' }, borderRadius: '12px', bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.main', px: 2, py: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BirthdayIcon color="primary" />
              <Box>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1 }}>ANIVERSARIANTES</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{monthlyBirthdays.length} este mês</Typography>
              </Box>
            </Stack>
          </Card>
          <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setIsFilterOpen(true)} sx={{ borderRadius: '10px' }}>Filtros</Button>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={(e) => setExportAnchor(e.currentTarget)} sx={{ borderRadius: '10px' }}>Exportar</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={{ borderRadius: '10px', px: 3 }}>Novo Cliente</Button>
        </Stack>
      </Box>

      {/* Stats Grid - MUI v7 size prop */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MotionCard elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '24px' }} whileHover={{ y: -5 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box><Typography variant="overline" color="textSecondary">Base Total</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.total}</Typography></Box>
              <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', width: 56, height: 56 }}><PeopleIcon /></Avatar>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MotionCard elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '24px' }} whileHover={{ y: -5 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box><Typography variant="overline" color="textSecondary">Ativos</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.ativos}</Typography></Box>
              <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 56, height: 56 }}><TrendingUpIcon /></Avatar>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MotionCard elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '24px' }} whileHover={{ y: -5 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box><Typography variant="overline" color="textSecondary">Clientes VIP</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.vips}</Typography></Box>
              <Avatar sx={{ bgcolor: 'secondary.lighter', color: 'secondary.main', width: 56, height: 56 }}><StarIcon /></Avatar>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      <Box mb={3}>
        <TextField fullWidth variant="outlined" placeholder="Buscar por nome, e-mail ou telefone..." value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }} sx={{ bgcolor: 'background.paper', borderRadius: '12px' }} />
      </Box>

      <Box sx={{ height: 650, width: '100%' }}>
        <Card sx={{ height: '100%', borderRadius: '24px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }} elevation={0}>
          <DataGrid rows={filteredCustomers} columns={columns} loading={isLoading} localeText={ptBR.components.MuiDataGrid.defaultProps.localeText} sx={{ border: 'none' }} />
        </Card>
      </Box>

      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MenuItem onClick={() => handleExport('fb')}><FacebookIcon sx={{ mr: 1, color: '#1877f2' }} /> Facebook Ads</MenuItem>
        <MenuItem onClick={() => handleExport('google')}><GoogleIcon sx={{ mr: 1, color: '#ea4335' }} /> Google Ads</MenuItem>
      </Menu>

      <Drawer anchor="right" open={isFilterOpen} onClose={() => setIsFilterOpen(false)} PaperProps={{ sx: { width: 320, p: 3, borderRadius: '24px 0 0 24px' } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Filtros Avançados</Typography>
        <Stack spacing={3}>
          <TextField label="Cadastrados após" type="date" fullWidth InputLabelProps={{ shrink: true }} />
          <Button variant="contained" fullWidth sx={{ mt: 'auto', borderRadius: '10px' }} onClick={() => setIsFilterOpen(false)}>Aplicar</Button>
        </Stack>
      </Drawer>

      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} PaperProps={{ sx: { width: 450, p: 3, borderRadius: '24px 0 0 24px' } }}>
        {selectedCustomer && (
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={4}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: stringToColor(selectedCustomer.name), fontWeight: 800 }}>{selectedCustomer.name[0]}</Avatar>
              <Box><Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedCustomer.name}</Typography><Typography variant="body2" color="text.secondary">{selectedCustomer.email}</Typography></Box>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 180, bgcolor: 'primary.lighter', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'primary.main', mb: 2 }}>
              <PersonPinCircle sx={{ fontSize: 50, color: 'primary.main' }} />
              <Typography variant="caption" sx={{ textAlign: 'center', px: 2, mt: 1 }}>{selectedCustomer.address || 'Sem endereço'}</Typography>
            </Box>
            <Button fullWidth variant="outlined" sx={{ mt: 4, borderRadius: '12px' }} onClick={() => setIsDrawerOpen(false)}> Fechar</Button>
          </Box>
        )}
      </Drawer>

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <CustomerForm 
            loading={mutation.isPending} 
            initialData={editingCustomer} 
            onSubmit={(data) => mutation.mutate({ ...editingCustomer, ...data })}
            onCancel={handleCloseModal} 
          />
        </DialogContent>
      </Dialog>
    </MotionContainer>
  );
};

export default CustomersPage;
