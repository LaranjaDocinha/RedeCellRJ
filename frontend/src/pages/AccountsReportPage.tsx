import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Modal,
  Stack,
  alpha,
  useTheme,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import moment from 'moment';
import { FaMoneyBillWave, FaFileInvoiceDollar, FaPlus, FaCalendarAlt } from 'react-icons/fa';

const AccountsReportPage: React.FC = () => {
  const theme = useTheme();
  const { addNotification } = useNotification();
  const [payables, setPayables] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [payableStatusFilter, setPayableStatusFilter] = useState<string>('');
  const [receivableStatusFilter, setReceivableStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [isPayableModalOpen, setIsPayableModalOpen] = useState(false);
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    const fetchBranches = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Falha ao carregar filiais');
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) setSelectedBranch(data[0].id);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, [token]);

  const fetchAccountsData = useCallback(async () => {
    if (!token || !selectedBranch) return;
    setLoading(true);
    try {
      const payableRes = await fetch(
        `/api/accounts/payable?branchId=${selectedBranch}&status=${payableStatusFilter}&startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const payableData = await payableRes.json();
      setPayables(Array.isArray(payableData) ? payableData : []);

      const receivableRes = await fetch(
        `/api/accounts/receivable?branchId=${selectedBranch}&status=${receivableStatusFilter}&startDate=${startDate}&endDate=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const receivableData = await receivableRes.json();
      setReceivables(Array.isArray(receivableData) ? receivableData : []);
    } catch (error) {
      console.error('Error fetching accounts data:', error);
      addNotification('Erro ao carregar dados financeiros', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, selectedBranch, payableStatusFilter, receivableStatusFilter, startDate, endDate, addNotification]);

  useEffect(() => {
    fetchAccountsData();
  }, [fetchAccountsData]);

  const handleUpdatePayableStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/accounts/payable/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, paidDate: status === 'paid' ? moment().toISOString() : null }),
      });
      if (res.ok) {
          addNotification('Status atualizado com sucesso', 'success');
          fetchAccountsData();
      }
    } catch (error) {
      addNotification('Erro ao atualizar status', 'error');
    }
  };

  const handleUpdateReceivableStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/accounts/receivable/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, receivedDate: status === 'received' ? moment().toISOString() : null }),
      });
      if (res.ok) {
          addNotification('Status atualizado com sucesso', 'success');
          fetchAccountsData();
      }
    } catch (error) {
      addNotification('Erro ao atualizar status', 'error');
    }
  };

  const handleAddPayable = async (formData: any) => {
    if (!token) return;
    try {
      const res = await fetch('/api/accounts/payable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, branch_id: selectedBranch }),
      });
      if (res.ok) {
          setIsPayableModalOpen(false);
          addNotification('Conta adicionada com sucesso', 'success');
          fetchAccountsData();
      }
    } catch (error) {
      addNotification('Erro ao adicionar conta', 'error');
    }
  };

  const handleAddReceivable = async (formData: any) => {
    if (!token) return;
    try {
      const res = await fetch('/api/accounts/receivable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, branch_id: selectedBranch }),
      });
      if (res.ok) {
          setIsReceivableModalOpen(false);
          addNotification('Conta adicionada com sucesso', 'success');
          fetchAccountsData();
      }
    } catch (error) {
      addNotification('Erro ao adicionar conta', 'error');
    }
  };

  if (loading && branches.length === 0) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  }

  return (
    <Box p={4}>
      <Typography variant="h3" fontWeight={400} gutterBottom sx={{ letterSpacing: '-2px', mb: 4 }}>
        Gestão Financeira
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
                <InputLabel>Filial de Operação</InputLabel>
                <Select value={selectedBranch} label="Filial de Operação" onChange={(e) => setSelectedBranch(e.target.value as string)} sx={{ borderRadius: '12px' }}>
                {branches.map(branch => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
                </Select>
            </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
            <TextField
                label="Período: De"
                type="date"
                fullWidth
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
            <TextField
                label="Período: Até"
                type="date"
                fullWidth
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Contas a Pagar */}
        <Grid size={{ xs: 12, lg: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '28px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}><FaMoneyBillWave size={20} /></Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={400}>Contas a Pagar</Typography>
                            <Typography variant="caption" color="text.secondary">Fluxo de saída e fornecedores</Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="error" startIcon={<FaPlus />} onClick={() => setIsPayableModalOpen(true)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 400 }}>Nova Conta</Button>
                </Stack>

                <FormControl sx={{ mb: 3, minWidth: 160 }} size="small">
                    <InputLabel>Filtrar Status</InputLabel>
                    <Select value={payableStatusFilter} label="Filtrar Status" onChange={(e) => setPayableStatusFilter(e.target.value as string)} sx={{ borderRadius: '10px' }}>
                        <MenuItem value="">Todos os Lançamentos</MenuItem>
                        <MenuItem value="pending">Pendentes</MenuItem>
                        <MenuItem value="paid">Liquidados</MenuItem>
                        <MenuItem value="overdue">Atrasados</MenuItem>
                    </Select>
                </FormControl>

                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>DESCRIÇÃO</TableCell>
                                <TableCell sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>VALOR</TableCell>
                                <TableCell sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>VENCIMENTO</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>AÇÕES</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payables.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>Nenhum lançamento encontrado</TableCell></TableRow>}
                            {payables.map((payable) => (
                                <TableRow key={payable.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={400}>{payable.description}</Typography>
                                        <Typography variant="caption" color="text.secondary">{payable.supplier_name || 'Sem fornecedor'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={400} color="error.main">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payable.amount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <FaCalendarAlt size={12} color={theme.palette.text.disabled} />
                                            <Typography variant="caption" fontWeight={400}>{moment(payable.due_date).format('DD/MM/YY')}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        {payable.status === 'pending' ? (
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleUpdatePayableStatus(payable.id, 'paid')} sx={{ borderRadius: '8px', fontSize: '0.7rem' }}>Liquidar</Button>
                                        ) : <Chip label="PAGO" size="small" color="success" sx={{ fontSize: '0.6rem', fontWeight: 400, height: 20 }} />}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>

        {/* Contas a Receber */}
        <Grid size={{ xs: 12, lg: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '28px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}><FaFileInvoiceDollar size={20} /></Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={400}>Contas a Receber</Typography>
                            <Typography variant="caption" color="text.secondary">Fluxo de entrada e clientes</Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" color="success" startIcon={<FaPlus />} onClick={() => setIsReceivableModalOpen(true)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 400 }}>Novo Recebível</Button>
                </Stack>

                <FormControl sx={{ mb: 3, minWidth: 160 }} size="small">
                    <InputLabel>Filtrar Status</InputLabel>
                    <Select value={receivableStatusFilter} label="Filtrar Status" onChange={(e) => setReceivableStatusFilter(e.target.value as string)} sx={{ borderRadius: '10px' }}>
                        <MenuItem value="">Todos os Lançamentos</MenuItem>
                        <MenuItem value="pending">Pendentes</MenuItem>
                        <MenuItem value="received">Recebidos</MenuItem>
                        <MenuItem value="overdue">Atrasados</MenuItem>
                    </Select>
                </FormControl>

                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>DESCRIÇÃO</TableCell>
                                <TableCell sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>VALOR</TableCell>
                                <TableCell sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>VENCIMENTO</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 400, bgcolor: 'background.paper' }}>AÇÕES</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {receivables.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>Nenhum lançamento encontrado</TableCell></TableRow>}
                            {receivables.map((receivable) => (
                                <TableRow key={receivable.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={400}>{receivable.description}</Typography>
                                        <Typography variant="caption" color="text.secondary">{receivable.customer_name || 'Sem cliente'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={400} color="success.main">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receivable.amount)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <FaCalendarAlt size={12} color={theme.palette.text.disabled} />
                                            <Typography variant="caption" fontWeight={400}>{moment(receivable.due_date).format('DD/MM/YY')}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        {receivable.status === 'pending' ? (
                                            <Button size="small" variant="outlined" color="success" onClick={() => handleUpdateReceivableStatus(receivable.id, 'received')} sx={{ borderRadius: '8px', fontSize: '0.7rem' }}>Receber</Button>
                                        ) : <Chip label="RECEBIDO" size="small" color="success" sx={{ fontSize: '0.6rem', fontWeight: 400, height: 20 }} />}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
      </Grid>

      {isPayableModalOpen && <AddAccountModal type="payable" onSave={handleAddPayable} onClose={() => setIsPayableModalOpen(false)} branches={branches} />}
      {isReceivableModalOpen && <AddAccountModal type="receivable" onSave={handleAddReceivable} onClose={() => setIsReceivableModalOpen(false)} branches={branches} />}
    </Box>
  );
};

const AddAccountModal = ({ type, onSave, onClose, branches }: any) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({ description: '', amount: '', due_date: moment().format('YYYY-MM-DD'), supplier_id: '', customer_id: '' });
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        const fetchRelatedData = async () => {
            if (!token) return;
            try {
                if (type === 'payable') {
                    const res = await fetch('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } });
                    const data = await res.json();
                    setSuppliers(Array.isArray(data) ? data : []);
                } else {
                    const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
                    const data = await res.json();
                    setCustomers(Array.isArray(data) ? data : []);
                }
            } catch (e) { console.error(e); }
        }
        fetchRelatedData();
    }, [token, type]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal open onClose={onClose} disableRestoreFocus>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '24px' }}>
                <Typography variant="h5" fontWeight={400} mb={3}>Lançar {type === 'payable' ? 'Conta a Pagar' : 'Conta a Receber'}</Typography>
                <Stack spacing={2.5}>
                    <TextField fullWidth name="description" label="Descrição do Lançamento" value={formData.description} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    <TextField fullWidth name="amount" label="Valor (R$)" type="number" value={formData.amount} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    <TextField fullWidth name="due_date" label="Data de Vencimento" type="date" value={formData.due_date} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    
                    {type === 'payable' ? (
                        <FormControl fullWidth>
                            <InputLabel>Fornecedor Responsável</InputLabel>
                            <Select name="supplier_id" value={formData.supplier_id} label="Fornecedor Responsável" onChange={handleChange} sx={{ borderRadius: '12px' }}>
                                {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    ) : (
                        <FormControl fullWidth>
                            <InputLabel>Cliente da Operação</InputLabel>
                            <Select name="customer_id" value={formData.customer_id} label="Cliente da Operação" onChange={handleChange} sx={{ borderRadius: '12px' }}>
                                {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
                <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                    <Button onClick={onClose} sx={{ borderRadius: '10px' }}>Cancelar</Button>
                    <Button variant="contained" color={type === 'payable' ? 'error' : 'success'} onClick={() => onSave(formData)} sx={{ borderRadius: '10px', px: 4, fontWeight: 400 }}>Salvar Lançamento</Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default AccountsReportPage;
