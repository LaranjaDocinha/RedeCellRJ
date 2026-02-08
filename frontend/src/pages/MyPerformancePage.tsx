import React from 'react';
import { useLoaderData, useNavigation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  LinearProgress, 
  Stack, 
  Card, 
  CardContent,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Button
} from '@mui/material';
import { FaTrophy, FaStar } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const MyPerformancePage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const data = useLoaderData() as any;

  const isNavigating = navigation.state === 'loading';

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh', position: 'relative' }}>
      
      {isNavigating && (
          <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />
      )}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction="row" alignItems="center" spacing={3} mb={5}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 400 }}>{user?.name?.[0]}</Avatar>
            <Box>
                <Typography variant="h4" fontWeight={400}>{user?.name}</Typography>
                <Typography variant="body1" color="text.secondary">Consultor de Vendas & Técnico</Typography>
            </Box>
        </Stack>
      </motion.div>

      <Grid container spacing={3} sx={{ opacity: isNavigating ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        
        {/* Metas e Progresso */}
        <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
                <Typography variant="h6" fontWeight={400} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaTrophy color={theme.palette.warning.main} /> Progresso da Meta Mensal
                </Typography>
                <Box sx={{ my: 4 }}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">Meta: R$ {data?.goals?.target?.toLocaleString()}</Typography>
                        <Typography variant="body2" fontWeight={400}>{data?.goals?.percent?.toFixed(1)}%</Typography>
                    </Stack>
                    <LinearProgress 
                        variant="determinate" 
                        value={Math.min(data?.goals?.percent || 0, 100)} 
                        sx={{ height: 12, borderRadius: 5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                    />
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Card variant="outlined" sx={{ borderRadius: '16px', bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                            <CardContent>
                                <Typography variant="caption" color="text.secondary">Comissão Acumulada</Typography>
                                <Typography variant="h5" fontWeight={400} color="success.main">R$ {data?.totals?.totalCommission?.toFixed(2)}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card variant="outlined" sx={{ borderRadius: '16px', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <CardContent>
                                <Typography variant="caption" color="text.secondary">Vendas Realizadas</Typography>
                                <Typography variant="h5" fontWeight={400} color="primary.main">{data?.sales?.length || 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: theme.palette.primary.main, color: 'white' }}>
                <Typography variant="h6" fontWeight={400} gutterBottom>Nível de Gamificação</Typography>
                <Box textAlign="center" py={2}>
                    <FaStar size={60} color="#FFD700" />
                    <Typography variant="h3" fontWeight={400} mt={2}>LVL 12</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Próximo nível em 450 XP</Typography>
                </Box>
                <Button fullWidth variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 400, mt: 2, '&:hover': { bgcolor: '#f0f0f0' } }}>
                    Ver Conquistas
                </Button>
            </Paper>
        </Grid>

        {/* Detalhamento de Vendas */}
        <Grid item xs={12}>
            <Paper sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
                    <Typography variant="h6" fontWeight={400}>Histórico de Vendas e Comissões</Typography>
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 400 }}>DATA</TableCell>
                            <TableCell sx={{ fontWeight: 400 }}>VALOR VENDA</TableCell>
                            <TableCell sx={{ fontWeight: 400 }}>ITENS</TableCell>
                            <TableCell sx={{ fontWeight: 400 }}>SUA COMISSÃO</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.sales?.map((sale: any) => (
                            <TableRow key={sale.id} hover>
                                <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                                <TableCell>R$ {Number(sale.total_amount).toFixed(2)}</TableCell>
                                <TableCell>{sale.items_count} un.</TableCell>
                                <TableCell sx={{ color: 'success.main', fontWeight: 400 }}>+ R$ {Number(sale.calculated_commission).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default MyPerformancePage;
