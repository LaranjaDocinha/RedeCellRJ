import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Checkbox, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button, 
  Grid, 
  LinearProgress,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Stack,
  IconButton
} from '@mui/material';
import { 
  CheckCircle, 
  School as SchoolIcon, 
  EmojiEvents as TrophyIcon, 
  AssignmentInd as UserIcon,
  Timeline as TimelineIcon,
  LibraryBooks as ChecklistIcon,
  ManageAccounts as ManagerIcon,
  ArrowForwardIos as ArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const OnboardingPage: React.FC = () => {
  const theme = useTheme();
  const [myProgress, setMyProgress] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedChecklist, setSelectedChecklist] = useState<string>('');
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  const isManager = useMemo(() => user?.permissions.some((p: any) => p.action === 'manage' && p.subject === 'Onboarding'), [user]);

  const fetchMyProgress = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMyProgress(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching my progress:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMyProgress();
      setLoading(false);
    };
    init();
  }, [token]);

  // Fetch manager data
  useEffect(() => {
    if (!token || !isManager) return;
    const fetchManagerData = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/onboarding/checklists', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUsers(await uRes.json());
        setChecklists(await cRes.json());
      } catch (e) { console.error(e); }
    };
    fetchManagerData();
  }, [token, isManager]);

  const completionPercentage = useMemo(() => {
    if (myProgress.length === 0) return 0;
    const completed = myProgress.filter(i => i.completed).length;
    return Math.round((completed / myProgress.length) * 100);
  }, [myProgress]);

  const handleCompleteItem = async (itemId: number) => {
    if (!token) return;
    try {
        await fetch('/api/onboarding/me/complete-item', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ itemId })
        });
        fetchMyProgress();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box p={4} sx={{ maxWidth: 1400, margin: '0 auto' }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>
            {isManager ? 'Gestão de Treinamento' : 'Meu Onboarding'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isManager 
              ? 'Acompanhe a evolução técnica e integração da sua equipe.' 
              : 'Bem-vindo à equipe Redecell! Siga seu roteiro de integração abaixo.'}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <SchoolIcon />
        </Avatar>
      </Box>

      <Grid container spacing={4}>
        {/* Lado Esquerdo: Progresso Pessoal */}
        <Grid item xs={12} md={isManager ? 7 : 12}>
          <Paper sx={{ p: 4, borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Box>
                <Typography variant="h5" fontWeight={800} gutterBottom>Roteiro de Integração</Typography>
                <Typography variant="body2" color="text.secondary">Complete as etapas para liberar novas funções no sistema.</Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="h4" fontWeight={900} color="primary">{completionPercentage}%</Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">CONCLUÍDO</Typography>
              </Box>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage} 
              sx={{ height: 12, borderRadius: 6, mb: 5, bgcolor: 'action.hover' }} 
            />

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {myProgress.length > 0 ? myProgress.map((item, idx) => (
                <motion.div key={item.item_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      border: item.completed ? '1px solid' : '1px solid',
                      borderColor: item.completed ? 'success.light' : 'divider',
                      bgcolor: item.completed ? 'rgba(76, 175, 80, 0.02)' : 'background.paper',
                      transition: '0.2s'
                    }}
                  >
                    <Checkbox 
                      checked={item.completed} 
                      onChange={() => handleCompleteItem(item.item_id)} 
                      disabled={item.completed} 
                      color="success"
                      icon={<Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid', borderColor: 'divider' }} />}
                      checkedIcon={<CheckCircle sx={{ fontSize: 28 }} />}
                    />
                    <ListItemText 
                      primary={<Typography fontWeight={700} sx={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'text.disabled' : 'text.primary' }}>{item.item_name}</Typography>}
                      secondary={item.completed ? `Finalizado em ${moment(item.completed_at).format('LLL')}` : 'Etapa pendente'}
                    />
                    {!item.completed && <Chip label="OBRIGATÓRIO" size="small" variant="outlined" sx={{ borderRadius: '6px', fontSize: '0.6rem', fontWeight: 900 }} />}
                  </Paper>
                </motion.div>
              )) : (
                <Box textAlign="center" py={6}>
                  <ChecklistIcon sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
                  <Typography color="text.secondary">Nenhum treinamento ativo no momento.</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Lado Direito: Manager Hub */}
        {isManager && (
          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: 'primary.main', color: 'white', boxShadow: '0 20px 40px rgba(25, 118, 210, 0.2)' }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <ManagerIcon sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={800}>Manager Hub</Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 4 }}>
                  Atribua trilhas de conhecimento e monitore o progresso dos novos colaboradores em tempo real.
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Selecionar Colaborador</InputLabel>
                    <Select 
                      value={selectedUser} 
                      label="Selecionar Colaborador" 
                      onChange={e => setSelectedUser(e.target.value)}
                      sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                    >
                      {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Escolher Trilha</InputLabel>
                    <Select 
                      value={selectedChecklist} 
                      label="Escolher Trilha" 
                      onChange={e => setSelectedChecklist(e.target.value)}
                      sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                    >
                      {checklists.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="secondary" 
                    sx={{ borderRadius: '12px', fontWeight: 800, py: 1.5 }}
                    onClick={() => {}} // Implementation placeholder
                  >
                    Atribuir Treinamento
                  </Button>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon color="primary" /> Recent Training Activity
                </Typography>
                <List sx={{ mt: 2 }}>
                  {[1, 2, 3].map(i => (
                    <ListItem key={i} sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}><Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>JD</Avatar></ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body2" fontWeight={700}>Juliana Dias</Typography>} 
                        secondary="Completou 'Manual de Segurança'" 
                      />
                      <Typography variant="caption" color="text.secondary">Há {i*5}m</Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OnboardingPage;