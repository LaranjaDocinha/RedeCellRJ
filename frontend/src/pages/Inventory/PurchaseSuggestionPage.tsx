import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { PageContainer } from '../../styles/common.styles';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Stack, 
  Avatar, 
  useTheme, 
  alpha, 
  Grid,
  Divider,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { 
  ShoppingCart, 
  Warning, 
  CheckCircle, 
  SmartToy, 
  TrendingUp, 
  Timeline, 
  Inventory,
  ChevronRight
} from '@mui/icons-material';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion } from 'framer-motion';

// --- Estilos Premium e Tematizados ---

const GlassCard = styled(Paper)`
  background: ${({ theme }) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.9)};
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.1)};
  border-radius: 24px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
    : '0 8px 32px rgba(0, 0, 0, 0.04)'};
`;

const SuggestionTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  margin-top: -8px;

  th {
    padding: 16px 20px;
    text-align: left;
    font-weight: 600;
    color: ${({ theme }) => theme.palette.text.secondary};
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
  }

  td {
    padding: 16px 20px;
    background: ${({ theme }) => alpha(theme.palette.background.paper, 0.4)};
    &:first-child { border-radius: 16px 0 0 16px; }
    &:last-child { border-radius: 0 16px 16px 0; }
    border-top: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.05)};
    border-bottom: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.05)};
  }

  tr {
    transition: all 0.2s;
    &:hover td {
      background: ${({ theme }) => alpha(theme.palette.primary.main, 0.05)};
    }
  }
`;

const AlertBadge = styled.span<{ level: 'critical' | 'warning' }>`
  background-color: ${({ theme, level }) => 
    level === 'critical' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.warning.main, 0.1)};
  color: ${({ theme, level }) => 
    level === 'critical' ? theme.palette.error.main : theme.palette.warning.main};
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${({ theme, level }) => 
    level === 'critical' ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.warning.main, 0.2)};
`;

const ABCBadge = styled.span<{ classification?: 'A' | 'B' | 'C' }>`
  background: ${props => 
    props.classification === 'A' ? 'linear-gradient(135deg, #d4af37 0%, #f9d423 100%)' : 
    props.classification === 'B' ? 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' : 
    'linear-gradient(135deg, #e67e22 0%, #d35400 100%)'};
  color: white;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;

const StatIconBox = styled(Box)<{ bgcolor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => alpha(props.bgcolor, 0.1)};
  color: ${props => props.bgcolor};
`;

// --- Interfaces ---

interface Suggestion {
  productId: number;
  productName: string;
  currentStock: number;
  avgWeeklyConsumption: number;
  daysOfCover: number;
  suggestedQuantity: number;
  classification?: 'A' | 'B' | 'C';
}

const PurchaseSuggestionPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/inventory/purchase-suggestions');
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = (suggestion: Suggestion) => {
    alert(`Gerando Pedido de Compra Estratégico para Item ${suggestion.classification}: ${suggestion.productName}`);
  };

  if (loading) return <LoadingSpinner />;

  const stats = {
    criticalA: suggestions.filter(s => s.classification === 'A').length,
    totalToBuy: suggestions.reduce((acc, s) => acc + s.suggestedQuantity, 0),
    urgency: suggestions.some(s => s.daysOfCover < 3) ? 'CRÍTICA' : 'NORMAL'
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* Header Inteligente */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', borderRadius: '12px', width: 40, height: 40, color: '#fff' }}>
              <SmartToy />
            </Avatar>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1.5 }}>
              INTELIGÊNCIA DE ESTOQUE
            </Typography>
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>Sugestões de Reposição</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Algoritmo preditivo baseado em Curva ABC e Giro de Estoque Real.</Typography>
        </Box>

        <Stack direction="row" spacing={1}>
             <ABCBadge classification="A">Classe A</ABCBadge>
             <ABCBadge classification="B">Classe B</ABCBadge>
             <ABCBadge classification="C">Classe C</ABCBadge>
        </Stack>
      </Box>

      {/* Cockpit de Indicadores */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: "Itens 'A' em Risco", val: stats.criticalA, icon: <Warning />, color: theme.palette.error.main, desc: "Ruptura iminente" },
          { label: "Volume Sugerido", val: stats.totalToBuy, icon: <ShoppingCart />, color: theme.palette.primary.main, desc: "Unidades totais" },
          { label: "Status de Urgência", val: stats.urgency, icon: <Timeline />, color: stats.urgency === 'CRÍTICA' ? theme.palette.error.main : theme.palette.success.main, desc: "Prioridade do sistema" }
        ].map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <GlassCard sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <StatIconBox bgcolor={item.color}>{item.icon}</StatIconBox>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>{item.label}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{item.val}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                </Box>
              </Stack>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {suggestions.length === 0 ? (
        <GlassCard sx={{ textAlign: 'center', p: 8 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2, opacity: 0.8 }} />
              <Typography variant="h5" fontWeight={700} gutterBottom>Estoque Otimizado</Typography>
              <Typography variant="body1" color="text.secondary">O algoritmo não identificou necessidade de reposição no momento.</Typography>
            </motion.div>
        </GlassCard>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <SuggestionTable>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Prioridade</th>
                <th>Estoque Atual</th>
                <th>Giro Semanal</th>
                <th>Saúde do Giro</th>
                <th>Sugestão</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((item, idx) => (
                <motion.tr 
                  key={item.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700, borderRadius: '12px' }}>
                        {item.productName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{item.productName}</Typography>
                    </Stack>
                  </td>
                  <td><ABCBadge classification={item.classification}>{item.classification}</ABCBadge></td>
                  <td>
                    <Typography variant="body2" fontWeight={700}>{item.currentStock}</Typography>
                    <Typography variant="caption" color="text.secondary">unidades</Typography>
                  </td>
                  <td>
                    <Typography variant="body2" fontWeight={600} color="primary.main">~{item.avgWeeklyConsumption.toFixed(1)}</Typography>
                    <Typography variant="caption" color="text.secondary">vendas/sem</Typography>
                  </td>
                  <td>
                    <Box sx={{ minWidth: 140 }}>
                      <AlertBadge level={item.daysOfCover < (item.classification === 'A' ? 14 : 7) ? 'critical' : 'warning'}>
                          <Warning sx={{ fontSize: 14 }} />
                          {item.daysOfCover} dias de cobertura
                      </AlertBadge>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((item.daysOfCover / 30) * 100, 100)} 
                        color={item.daysOfCover < 7 ? 'error' : 'warning'}
                        sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.divider, 0.1) }}
                      />
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp color="success" fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                        + {item.suggestedQuantity}
                      </Typography>
                    </Box>
                  </td>
                  <td align="right">
                    <Button 
                      onClick={() => handleCreateOrder(item)}
                      variant="outlined"
                      size="small"
                      endIcon={<ChevronRight />}
                      sx={{ 
                        borderRadius: '10px', 
                        textTransform: 'none', 
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'primary.main', color: '#fff', border: '1px solid primary.main' }
                      }}
                    >
                      Repor
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </SuggestionTable>
        </Box>
      )}
    </Box>
  );
};

export default PurchaseSuggestionPage;