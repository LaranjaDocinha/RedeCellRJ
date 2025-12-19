import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem, FormControl, InputLabel, TextField, Modal } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const AccountsReportPage: React.FC = () => {
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
        const data = await res.json();
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0].id);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, [token]);

  useEffect(() => {
    const fetchAccountsData = async () => {
      if (!token || !selectedBranch) return;
      setLoading(true);
      try {
        const payableRes = await fetch(
          `/api/accounts/payable?branchId=${selectedBranch}&status=${payableStatusFilter}&startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const payableData = await payableRes.json();
        setPayables(payableData);

        const receivableRes = await fetch(
          `/api/accounts/receivable?branchId=${selectedBranch}&status=${receivableStatusFilter}&startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const receivableData = await receivableRes.json();
        setReceivables(receivableData);
      } catch (error) {
        console.error('Error fetching accounts data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountsData();
  }, [token, selectedBranch, payableStatusFilter, receivableStatusFilter, startDate, endDate]);

  const handleUpdatePayableStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      await fetch(`/api/accounts/payable/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, paidDate: status === 'paid' ? moment().toISOString() : null }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating payable status:', error);
    }
  };

  const handleUpdateReceivableStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      await fetch(`/api/accounts/receivable/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, receivedDate: status === 'received' ? moment().toISOString() : null }),
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating receivable status:', error);
    }
  };

  const handleAddPayable = async (formData: any) => {
    if (!token) return;
    try {
      await fetch('/api/accounts/payable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, branch_id: selectedBranch }),
      });
      setIsPayableModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding payable:', error);
    }
  };

  const handleAddReceivable = async (formData: any) => {
    if (!token) return;
    try {
      await fetch('/api/accounts/receivable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, branch_id: selectedBranch }),
      });
      setIsReceivableModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding receivable:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Contas a Pagar e Receber</Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filial</InputLabel>
            <Select value={selectedBranch} label="Filial" onChange={(e) => setSelectedBranch(e.target.value as string)}>
              {branches.map(branch => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data Início"
            type="date"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data Fim"
            type="date"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>

      {/* Contas a Pagar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Contas a Pagar</Typography>
          <Button variant="contained" onClick={() => setIsPayableModalOpen(true)}>Adicionar Conta</Button>
        </Box>
        <FormControl sx={{ mb: 2, minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={payableStatusFilter} label="Status" onChange={(e) => setPayableStatusFilter(e.target.value as string)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="paid">Pago</MenuItem>
            <MenuItem value="overdue">Atrasado</MenuItem>
          </Select>
        </FormControl>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payables.map((payable) => (
                <TableRow key={payable.id}>
                  <TableCell>{payable.description}</TableCell>
                  <TableCell>{payable.supplier_name || 'N/A'}</TableCell>
                  <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payable.amount)}</TableCell>
                  <TableCell>{moment(payable.due_date).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{payable.status}</TableCell>
                  <TableCell>
                    {payable.status === 'pending' && (
                      <Button size="small" onClick={() => handleUpdatePayableStatus(payable.id, 'paid')}>Marcar como Pago</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Contas a Receber */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Contas a Receber</Typography>
          <Button variant="contained" onClick={() => setIsReceivableModalOpen(true)}>Adicionar Conta</Button>
        </Box>
        <FormControl sx={{ mb: 2, minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={receivableStatusFilter} label="Status" onChange={(e) => setReceivableStatusFilter(e.target.value as string)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="received">Recebido</MenuItem>
            <MenuItem value="overdue">Atrasado</MenuItem>
          </Select>
        </FormControl>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell>{receivable.description}</TableCell>
                  <TableCell>{receivable.customer_name || 'N/A'}</TableCell>
                  <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receivable.amount)}</TableCell>
                  <TableCell>{moment(receivable.due_date).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{receivable.status}</TableCell>
                  <TableCell>
                    {receivable.status === 'pending' && (
                      <Button size="small" onClick={() => handleUpdateReceivableStatus(receivable.id, 'received')}>Marcar como Recebido</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {isPayableModalOpen && <AddAccountModal type="payable" onSave={handleAddPayable} onClose={() => setIsPayableModalOpen(false)} branches={branches} selectedBranch={selectedBranch} />}
      {isReceivableModalOpen && <AddAccountModal type="receivable" onSave={handleAddReceivable} onClose={() => setIsReceivableModalOpen(false)} branches={branches} selectedBranch={selectedBranch} />}
    </Box>
  );
};

const AddAccountModal = ({ type, onSave, onClose, branches, selectedBranch }: any) => {
    const [formData, setFormData] = useState({ description: '', amount: '', dueDate: moment().format('YYYY-MM-DD'), supplier_id: '', customer_id: '' });
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        const fetchRelatedData = async () => {
            if (!token) return;
            if (type === 'payable') {
                const res = await fetch('/api/suppliers', { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setSuppliers(data);
            } else {
                const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                setCustomers(data);
            }
        }
        fetchRelatedData();
    }, [token, type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name as string]: value });
    };

    return (
        <Modal open onClose={onClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                <Typography variant="h6">Adicionar {type === 'payable' ? 'Conta a Pagar' : 'Conta a Receber'}</Typography>
                <TextField fullWidth name="description" label="Descrição" value={formData.description} onChange={handleChange} sx={{ my: 2 }} />
                <TextField fullWidth name="amount" label="Valor" type="number" value={formData.amount} onChange={handleChange} sx={{ my: 2 }} />
                <TextField fullWidth name="dueDate" label="Data de Vencimento" type="date" value={formData.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={{ my: 2 }} />
                {type === 'payable' && (
                    <FormControl fullWidth sx={{ my: 2 }}>
                        <InputLabel>Fornecedor</InputLabel>
                        <Select name="supplier_id" value={formData.supplier_id} label="Fornecedor" onChange={handleChange}>
                            {suppliers.map(supplier => <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                )}
                {type === 'receivable' && (
                    <FormControl fullWidth sx={{ my: 2 }}>
                        <InputLabel>Cliente</InputLabel>
                        <Select name="customer_id" value={formData.customer_id} label="Cliente" onChange={handleChange}>
                            {customers.map(customer => <MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                )}
                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button onClick={onClose} sx={{ mr: 1 }}>Cancelar</Button>
                    <Button variant="contained" onClick={() => onSave(formData)}>Salvar</Button>
                </Box>
            </Box>
        </Modal>
    )
}

export default AccountsReportPage;
