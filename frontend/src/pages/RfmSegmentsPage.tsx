import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Skeleton, 
  Container, 
  Avatar, 
  Stack, 
  Chip, 
  Divider, 
  Button, 
  useTheme,
  Paper
} from '@mui/material';
import { 
  Groups as UsersIcon, 
  Stars as VipIcon, 
  Warning as RiskIcon, 
  History as ReengageIcon,
  TrendingUp,
  LocalFireDepartment as HotIcon,
  RecordVoiceOver as ChatIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SegmentData {
  rfm_segment: string;
  customer_count: number;
  description: string;
  color: string;
  icon: React.ReactNode;
  action: string;
}

const RfmSegmentsPage: React.FC = () => {
  const theme = useTheme();
  const [segments, setSegments] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const segmentDefinitions: Record<string, Partial<SegmentData>> = {
    'Campeões': { color: '#4caf50', icon: <HotIcon />, description: 'Compram recentemente, com frequência e gastam muito.', action: 'Recompensar com exclusividade' },
    'Clientes Fiéis': { color: theme.palette.primary.main, icon: <VipIcon />, description: 'Compram com regularidade. Ótima resposta a upsell.', action: 'Programa de fidelidade' },
    'Potenciais Fiéis': { color: '#0288d1', icon: <TrendingUp />, description: 'Compradores recentes com bom potencial de gasto.', action: 'Sugerir produtos relacionados' },
    'Novos Clientes': { color: '#9c27b0', icon: <UsersIcon />, description: 'Fizeram a primeira compra recentemente.', action: 'Fluxo de boas-vindas' },
    'Em Risco': { color: '#ed6c02', icon: <RiskIcon />, description: 'Não compram há algum tempo. Precisam ser reativados.', action: 'Enviar cupom de desconto' },
    'Não podemos perder': { color: '#d32f2f', icon: <RiskIcon />, description: 'Eram grandes compradores, mas pararam de vir.', action: 'Atendimento personalizado' },
    'Hibernando': { color: '#757575', icon: <ReengageIcon />, description: 'Baixa frequência e não compram há muito tempo.', action: 'Campanha de reengajamento' },
  };

  useEffect(() => {
    const fetchSegments = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/rfm/segments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        const mappedData = data.map((s: any) => ({
          ...s,
          ...(segmentDefinitions[s.rfm_segment] || { color: '#757575', icon: <UsersIcon />, description: 'Segmento geral de clientes.', action: 'Manter contato' })
        }));
        setSegments(mappedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSegments();
  }, [token]);

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
            <VipIcon />
          </Box>
          <Typography variant="overline" sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 2 }}>
            INTELIGÊNCIA DE CLIENTES
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
          Matriz de Segmentação RFM
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 800 }}>
          Analise sua base de clientes através dos pilares de <strong>Recência, Frequência e Valor Monetário</strong> para criar campanhas de marketing ultra-direcionadas.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: '24px' }} />
            </Grid>
          ))
        ) : (
          segments.map((segment, idx) => (
            <Grid item xs={12} sm={6} md={4} key={segment.rfm_segment}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card 
                  component={Link} 
                  to={`/customers/segments/${segment.rfm_segment}`} 
                  sx={{ 
                    textDecoration: 'none', 
                    borderRadius: '24px', 
                    height: '100%', 
                    border: '1px solid', 
                    borderColor: 'divider',
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-8px)', borderColor: segment.color, boxShadow: `0 15px 30px ${segment.color}15` }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                      <Avatar sx={{ bgcolor: `${segment.color}15`, color: segment.color, borderRadius: '14px', width: 48, height: 48 }}>
                        {segment.icon}
                      </Avatar>
                      <Chip 
                        label={`${segment.customer_count} Clientes`} 
                        sx={{ fontWeight: 400, bgcolor: segment.color, color: 'white', borderRadius: '8px' }} 
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={400} gutterBottom>{segment.rfm_segment}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, height: 40, overflow: 'hidden' }}>
                      {segment.description}
                    </Typography>
                    
                    <Divider sx={{ mb: 2, opacity: 0.5 }} />
                    
                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '12px' }}>
                      <Typography variant="caption" fontWeight={400} color="primary" display="block">RECOMENDAÇÃO:</Typography>
                      <Typography variant="caption" fontWeight={400} color="text.primary">{segment.action}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>

      <Box mt={8} p={4} sx={{ borderRadius: '32px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" fontWeight={400} gutterBottom>Como funciona o RFM?</Typography>
            <Typography variant="body2" color="text.secondary">
              O modelo pontua os clientes de 1 a 5 em cada pilar. O resultado final gera clusters automáticos que permitem diferenciar quem são seus melhores clientes daqueles que estão parando de comprar, facilitando o investimento correto em marketing.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="right">
            <Button variant="contained" size="large" sx={{ borderRadius: '12px', fontWeight: 400, px: 4 }}>
              Atualizar Matriz Agora
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RfmSegmentsPage;
