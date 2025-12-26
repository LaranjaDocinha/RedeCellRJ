import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import { 
  FaSearch, 
  FaStar, 
  FaHistory, 
  FaGift, 
  FaUserCircle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const StyledPageContainer = styled(motion.div)`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const StyledPageTitle = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -1px;
`;

interface LoyaltyTransaction {
  id: number;
  customer_id: number;
  points_change: number;
  action_type: 'earn' | 'redeem';
  reason?: string;
  created_at: string;
}

interface CustomerLoyaltyInfo {
    customer_id: number;
    name: string;
    email?: string;
    phone?: string;
    loyalty_points: number;
    tier_name?: string;
    total_earned?: number;
    total_redeemed?: number;
}

const LoyaltyPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerLoyaltyInfo[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLoyaltyInfo | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const fetchLoyaltyData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/loyalty/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      addNotification('Erro ao carregar dados de fidelidade', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  const fetchTransactions = useCallback(async (customerId: number) => {
    try {
        const response = await axios.get(`/api/loyalty/transactions/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data);
    } catch (e) {
        addNotification('Erro ao buscar histórico', 'error');
    }
  }, [token, addNotification]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone?.includes(search)
    );
  }, [customers, search]);

  const handleSelectCustomer = (customer: CustomerLoyaltyInfo) => {
    setSelectedCustomer(customer);
    fetchTransactions(customer.customer_id);
  };

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <StyledPageTitle>Programa de Fidelidade</StyledPageTitle>
        <TextField 
            size="small"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
                startAdornment: <InputAdornment position="start"><FaSearch size={14} /></InputAdornment>,
                sx: { borderRadius: '12px', width: 300 }
            }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Lista de Clientes */}
        <Grid item xs={12} lg={selectedCustomer ? 4 : 12}>
            <TableContainer component={Paper} sx={{ borderRadius: '24px', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>CLIENTE</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>PONTOS</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>NÍVEL</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                        ) : filteredCustomers.map(c => (
                            <TableRow key={c.customer_id} hover selected={selectedCustomer?.customer_id === c.customer_id} onClick={() => handleSelectCustomer(c)} sx={{ cursor: 'pointer' }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{c.phone || 'Sem telefone'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={`${c.loyalty_points} pts`} color="primary" size="small" sx={{ fontWeight: 800 }} />
                                </TableCell>
                                <TableCell>
                                    <Chip label={c.tier_name || 'Standard'} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small"><FaHistory size={12} /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>

        {/* Painel de Detalhes e Histórico */}
        {selectedCustomer && (
            <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                    {/* Cards de Resumo */}
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ borderRadius: '20px', textAlign: 'center', bgcolor: 'primary.50' }}>
                                <CardContent>
                                    <FaStar color="#ed6c02" />
                                    <Typography variant="h5" fontWeight={900}>{selectedCustomer.loyalty_points}</Typography>
                                    <Typography variant="caption">Saldo Atual</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ borderRadius: '20px', textAlign: 'center' }}>
                                <CardContent>
                                    <FaArrowUp color="green" />
                                    <Typography variant="h5" fontWeight={900}>{selectedCustomer.total_earned || 0}</Typography>
                                    <Typography variant="caption">Total Ganho</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ borderRadius: '20px', textAlign: 'center' }}>
                                <CardContent>
                                    <FaArrowDown color="red" />
                                    <Typography variant="h5" fontWeight={900}>{selectedCustomer.total_redeemed || 0}</Typography>
                                    <Typography variant="caption">Total Resgatado</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card sx={{ borderRadius: '20px', textAlign: 'center', bgcolor: 'secondary.50' }}>
                                <CardContent>
                                    <FaGift color="#9c27b0" />
                                    <Typography variant="h5" fontWeight={900}>R$ {(selectedCustomer.loyalty_points * 0.1).toFixed(2)}</Typography>
                                    <Typography variant="caption">Valor em R$</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tabela de Transações */}
                    <Paper sx={{ borderRadius: '24px', p: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Typography variant="h6" fontWeight={800} mb={2}>Histórico de Movimentações</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>DATA</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>TIPO</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>PONTOS</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>MOTIVO</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map(t => (
                                        <TableRow key={t.id} hover>
                                            <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(t.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={t.action_type === 'earn' ? 'GANHO' : 'RESGATE'} 
                                                    size="small" 
                                                    color={t.action_type === 'earn' ? 'success' : 'secondary'}
                                                    sx={{ fontSize: '0.6rem', height: 20, fontWeight: 800 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: t.points_change > 0 ? 'success.main' : 'error.main' }}>
                                                {t.points_change > 0 ? `+${t.points_change}` : t.points_change}
                                            </TableCell>
                                            <TableCell variant="body2" sx={{ fontSize: '0.75rem' }}>{t.reason || 'Venda PDV'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Stack>
            </Grid>
        )}
      </Grid>
    </StyledPageContainer>
  );
};

export default LoyaltyPage;
