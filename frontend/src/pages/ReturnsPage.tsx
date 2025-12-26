import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AssignmentReturn as ReturnIcon,
  PendingActions as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  Gavel as ReasonIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { ReturnForm } from '../components/ReturnForm';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';

const ReturnsPage: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<any>(undefined);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // Queries & Mutations (Simulated for rich UI)
  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      // Mock data
      return [
        { id: 1, sale_id: 1024, customer_name: 'Marcos Silva', return_date: new Date().toISOString(), status: 'pending', refund_amount: 150.00, reason: 'Defeito na Tela' },
        { id: 2, sale_id: 1012, customer_name: 'Ana Paula', return_date: new Date().toISOString(), status: 'approved', refund_amount: 89.90, reason: 'Incompatibilidade' },
      ];
    }
  });

  const stats = useMemo(() => ({
    total: returns.length,
    pending: returns.filter((r: any) => r.status === 'pending').length,
    approved: returns.filter((r: any) => r.status === 'approved').length,
    totalRefunded: returns.reduce((acc: any, curr: any) => acc + curr.refund_amount, 0)
  }), [returns]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID RMA', width: 100, renderCell: (params) => <Typography variant="caption">#RMA-{params.value}</Typography> },
    { field: 'sale_id', headerName: 'Venda', width: 120, renderCell: (params) => <Chip label={`#${params.value}`} size="small" variant="outlined" /> },
    { field: 'customer_name', headerName: 'Cliente', flex: 1, minWidth: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value.toString().toUpperCase()} 
          color={params.value === 'approved' ? 'success' : params.value === 'pending' ? 'warning' : 'default'} 
          size="small" 
          sx={{ fontSize: '0.65rem' }} 
        />
      )
    },
    { 
      field: 'refund_amount', 
      headerName: 'Reembolso', 
      width: 150,
      renderCell: (params) => <Typography color="primary">R$ {params.value.toFixed(2)}</Typography>
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedRowId(params.row.id); }}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">
          Trocas e Logística Reversa
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setIsModalOpen(true)}
          sx={{ borderRadius: '12px', px: 3, bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
        >
          Nova Devolução
        </Button>
      </Box>

      {/* KPI Stats */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { label: 'Total RMAs', value: stats.total, icon: <ReturnIcon />, color: theme.palette.primary.main },
          { label: 'Pendentes', value: stats.pending, icon: <PendingIcon />, color: theme.palette.warning.main },
          { label: 'Aprovados', value: stats.approved, icon: <ApprovedIcon />, color: theme.palette.success.main },
          { label: 'Reembolsado', value: `R$ ${stats.totalRefunded.toFixed(2)}`, icon: <MoneyIcon />, color: theme.palette.info.main },
        ].map((s, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card sx={{ borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{ bgcolor: `${s.color}15`, color: s.color, width: 56, height: 56, borderRadius: '16px' }}>
                  {s.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  <Typography variant="h5">{s.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: '32px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Histórico de RMAs</Typography>
          <TextField 
            size="small" 
            placeholder="Buscar..." 
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.disabled' }} /> }}
            sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </Box>
        <Box height={500} sx={{ p: 1 }}>
          <DataGrid
            rows={returns}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' } }}
          />
        </Box>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem onClick={() => setAnchorEl(null)}><ViewIcon fontSize="small" sx={{ mr: 1 }} /> Ver Detalhes</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}><EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar Status</MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Cancelar RMA</MenuItem>
      </Menu>

      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px' } }}
      >
        <DialogTitle>Nova Solicitação de Devolução</DialogTitle>
        <DialogContent>
          <Box mt={1}>
             <ReturnForm onSubmit={(data) => { setIsModalOpen(false); showNotification('Devolução criada com sucesso!', 'success'); }} onCancel={() => setIsModalOpen(false)} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ReturnsPage;