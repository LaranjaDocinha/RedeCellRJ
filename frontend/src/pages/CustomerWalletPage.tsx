import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress, List, ListItem, ListItemText, Divider, Grid, Button, Modal, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Transaction {
  id: number;
  amount: string;
  type: 'credit' | 'debit';
  reason: string;
  created_at: string;
}

const CustomerWalletPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [reasonForAdd, setReasonForAdd] = useState('');
  const { token } = useAuth();

  const fetchData = async () => {
    if (!customerId || !token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/store-credit/${customerId}/credit/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch wallet data');
      const data = await response.json();
      setBalance(data.balance);
      setTransactions(data.history);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customerId, token]);

  const handleAddCredit = async () => {
    if (!customerId || !token || !amountToAdd || !reasonForAdd) return;
    try {
      const response = await fetch(`/api/store-credit/${customerId}/credit/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amountToAdd),
          reason: reasonForAdd,
        }),
      });
      if (!response.ok) throw new Error('Failed to add credit');
      // Refresh data and close modal
      fetchData();
      setIsModalOpen(false);
      setAmountToAdd('');
      setReasonForAdd('');
    } catch (error) {
      console.error('Error adding store credit:', error);
    }
  };


  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>Carteira do Cliente</Typography>
        <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
          Adicionar Crédito
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Saldo Atual</Typography>
                <Typography variant="h3" color={balance && parseFloat(balance) > 0 ? 'primary' : 'text.secondary'}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(balance || '0'))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6">Histórico de Transações</Typography>
                <List>
                  {transactions.length === 0 ? (
                    <Typography>Nenhuma transação encontrada.</Typography>
                  ) : (
                    transactions.map(tx => (
                      <React.Fragment key={tx.id}>
                        <ListItem>
                          <ListItemText
                            primary={`${tx.type === 'credit' ? 'Crédito' : 'Débito'}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(tx.amount))}`}
                            secondary={`${tx.reason} em ${new Date(tx.created_at).toLocaleString()}`}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Modal para adicionar crédito manualmente */}
      {/*
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>Adicionar Crédito Manualmente</Typography>
          <TextField
            label="Valor (R$)"
            type="number"
            fullWidth
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Motivo"
            fullWidth
            value={reasonForAdd}
            onChange={(e) => setReasonForAdd(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={() => setIsModalOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleAddCredit}>Adicionar</Button>
          </Box>
        </Box>
      </Modal>
      */}
    </Box>
  );
};

export default CustomerWalletPage;