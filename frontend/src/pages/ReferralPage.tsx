import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Button,
  Stack,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  CardGiftcard as GiftIcon, 
  Share as ShareIcon, 
  EmojiEvents as TrophyIcon, 
  People as UsersIcon,
  ContentCopy as CopyIcon,
  CheckCircle as DoneIcon,
  TrendingUp,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import { motion } from 'framer-motion';

const ReferralPage: React.FC = () => {
  const theme = useTheme();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // Mock data for rich UI demo
        setTimeout(() => {
          setReferralCode('REDECELL-FRIEND-2025');
          setHistory([
            { id: 1, referred_customer_name: 'Marcos Silva', status: 'completed', date: moment().subtract(2, 'days'), reward: 'R$ 50,00' },
            { id: 2, referred_customer_name: 'Ana Paula', status: 'pending', date: moment().subtract(1, 'day'), reward: 'Pendente' },
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [token]);

  const copyToClipboard = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      alert('Código copiado!');
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress thickness={5} size={60} />
    </Box>
  );

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto', bgcolor: 'background.default' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '10px', color: 'white', display: 'flex' }}>
              <GiftIcon />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 2 }}>
              PROGRAMA DE CRESCIMENTO
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 400, letterSpacing: '-1.5px' }}>
            Indique e Ganhe
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Compartilhe seu código com amigos e ganhe créditos na sua próxima compra ou reparo.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Card de Código Principal */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: 'primary.main', color: 'white', boxShadow: '0 20px 60px rgba(25, 118, 210, 0.2)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}><TrophyIcon sx={{ fontSize: 200 }} /></Box>
            
            <Typography variant="h6" fontWeight={400} gutterBottom>Seu Código Exclusivo</Typography>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: '20px', mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed rgba(255,255,255,0.3)' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontFamily: 'monospace', letterSpacing: 2 }}>{referralCode}</Typography>
              <IconButton onClick={copyToClipboard} sx={{ color: 'white' }}><CopyIcon /></IconButton>
            </Box>
            
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<ShareIcon />}
              sx={{ mt: 4, bgcolor: 'white', color: 'primary.main', borderRadius: '14px', py: 1.5, fontWeight: 400, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            >
              CONVIDAR AMIGOS
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mt: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight={400} mb={2}>Como funciona?</Typography>
            <Stack spacing={2}>
              <Box display="flex" gap={2}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main' }}>1</Avatar>
                <Typography variant="caption" color="text.secondary">Envie seu código para um amigo que ainda não é cliente.</Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main' }}>2</Avatar>
                <Typography variant="caption" color="text.secondary">Seu amigo ganha 10% de desconto na primeira compra ou serviço.</Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: 'primary.main' }}>3</Avatar>
                <Typography variant="caption" color="text.secondary">Após a compra dele, você recebe R$ 50,00 em créditos Redecell.</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Histórico de Indicações */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ borderRadius: '32px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', height: '100%' }}>
            <Box p={3} borderBottom="1px solid" borderColor="divider">
              <Typography variant="h6" fontWeight={400}>Suas Indicações</Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {history.length > 0 ? (
                history.map((ref, idx) => (
                  <React.Fragment key={ref.id}>
                    <ListItem sx={{ px: 4, py: 3, '&:hover': { bgcolor: 'action.hover' } }}>
                      <Box display="flex" alignItems="center" gap={3} width="100%">
                        <Avatar sx={{ bgcolor: ref.status === 'completed' ? 'success.light' : 'warning.light' }}>
                          <UsersIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="body1" fontWeight={400}>{ref.referred_customer_name}</Typography>
                          <Typography variant="caption" color="text.secondary">Indicado em {moment(ref.date).format('LL')}</Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight={400} color={ref.status === 'completed' ? 'success.main' : 'warning.main'}>
                            {ref.reward}
                          </Typography>
                          <Chip 
                            label={ref.status === 'completed' ? 'RESGATADO' : 'PENDENTE'} 
                            size="small" 
                            variant="outlined" 
                            sx={{ height: 16, fontSize: '0.55rem', fontWeight: 400, mt: 0.5 }} 
                          />
                        </Box>
                      </Box>
                    </ListItem>
                    {idx < history.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                  </React.Fragment>
                ))
              ) : (
                <Box textAlign="center" py={10}>
                  <UsersIcon sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
                  <Typography color="text.secondary">Você ainda não indicou ninguém. Comece agora!</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReferralPage;
