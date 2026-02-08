import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Stack, 
  Avatar, 
  IconButton, 
  TextField,
  Chip,
  useTheme,
  alpha,
  Divider,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { 
  FaClock, FaCamera, FaPlay, FaPause, FaCheck, FaBarcode, FaTools, FaImage, FaHistory, FaListUl, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useLoaderData } from 'react-router-dom';
import TechnicalChecklist from '../components/TechBench/TechnicalChecklist';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const TechBenchPage: React.FC = () => {
  const theme = useTheme();
  const { user, token } = useAuth();
  const { addNotification } = useNotification();
  const { activeOrders } = useLoaderData() as { activeOrders: any[] };
  
  // Prioritize active order from loader if available
  const initialSO = activeOrders && activeOrders.length > 0 ? activeOrders[0] : null;

  const [activeSO, setActiveSO] = useState<any>(initialSO);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [imeiInput, setImeiInput] = useState('');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  // Simulação de busca de OS por IMEI (Fallback ou Nova Busca)
  const handleScanIMEI = async () => {
    if (!imeiInput) return;
    addNotification('Buscando Ordem de Serviço...', 'info');
    // Mock de resposta do servidor (Futuro: chamar API real)
    setTimeout(() => {
        setActiveSO({
            id: 1250,
            customer: 'João Silva',
            device: 'iPhone 13 Pro',
            issue: 'Troca de Tela e Bateria',
            status: 'Em Reparo',
            priority: 'high'
        });
        addNotification('OS Localizada!', 'success');
    }, 800);
  };

  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSaveChecklist = async (checklistData: any) => {
      try {
          if (!activeSO) return;
          // API Call to save checklist
          // await axios.put(`${API_BASE_URL}/api/service-orders/${activeSO.id}/checklist`, { checklist: checklistData }, { headers: { Authorization: `Bearer ${token}` } });
          console.log('Checklist saved:', checklistData);
          
          setActiveSO((prev: any) => ({ ...prev, entry_checklist: checklistData }));
          setIsChecklistOpen(false);
          addNotification('Checklist salvo com sucesso!', 'success');
      } catch (error) {
          addNotification('Erro ao salvar checklist.', 'error');
      }
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      
      {/* Header Compacto */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
            <Typography variant="h5" fontWeight={400}>Modo Bancada</Typography>
            <Typography variant="caption" color="text.secondary">Técnico: {user?.name}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.name?.[0]}</Avatar>
      </Stack>

      {!activeSO ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center', border: `2px dashed ${theme.palette.divider}` }}>
                <FaBarcode size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                <Typography variant="h6" fontWeight={400} mb={3}>Bipe o IMEI ou QR Code da OS</Typography>
                <TextField 
                    fullWidth 
                    placeholder="Digitar IMEI..." 
                    value={imeiInput}
                    onChange={(e) => setImeiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScanIMEI()}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <Button fullWidth variant="contained" size="large" onClick={handleScanIMEI} sx={{ borderRadius: '12px', py: 1.5 }}>
                    Localizar Equipamento
                </Button>
            </Paper>
        </motion.div>
      ) : (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {/* Status do Reparo Ativo */}
                <Paper sx={{ p: 3, borderRadius: '24px', mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                            <Chip label={`OS #${activeSO.id}`} size="small" color="primary" sx={{ fontWeight: 400, mb: 1 }} />
                            <Typography variant="h5" fontWeight={400}>{activeSO.device || activeSO.product_description}</Typography>
                            <Typography variant="body2" color="text.secondary">{activeSO.customer || activeSO.customer_name}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" fontWeight={400} sx={{ fontFamily: 'monospace', color: timerActive ? 'primary.main' : 'text.disabled' }}>
                                {formatTime(elapsedSeconds)}
                            </Typography>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Tempo de Reparo</Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" fontWeight={400} gutterBottom>DEFEITO RELATADO:</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>{activeSO.issue || activeSO.issue_description}</Typography>

                    <Stack direction="row" spacing={2}>
                        <Button 
                            fullWidth 
                            variant={timerActive ? "outlined" : "contained"} 
                            startIcon={timerActive ? <FaPause /> : <FaPlay />}
                            onClick={() => setTimerActive(!timerActive)}
                            sx={{ borderRadius: '12px', py: 1.5 }}
                        >
                            {timerActive ? "Pausar" : "Iniciar Reparo"}
                        </Button>
                        <Button fullWidth variant="contained" color="success" startIcon={<FaCheck />} sx={{ borderRadius: '12px' }}>
                            Finalizar
                        </Button>
                    </Stack>
                </Paper>

                {/* Ações Técnicas */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            startIcon={<FaListUl />} 
                            onClick={() => setIsChecklistOpen(true)}
                            color={activeSO.entry_checklist ? "success" : "warning"}
                            sx={{ borderRadius: '12px', py: 1.5, borderStyle: 'dashed' }}
                        >
                            {activeSO.entry_checklist ? "Checklist Preenchido" : "Preencher Checklist de Entrada"}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                            <FaCamera size={24} color={theme.palette.primary.main} />
                            <Typography variant="caption" display="block" mt={1} fontWeight={400}>FOTO ANTES</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: '16px', textAlign: 'center', height: '100%' }}>
                            <FaImage size={24} color={theme.palette.success.main} />
                            <Typography variant="caption" display="block" mt={1} fontWeight={400}>FOTO DEPOIS</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: '20px' }}>
                            <Typography variant="subtitle2" fontWeight={400} mb={2}>NOTAS TÉCNICAS:</Typography>
                            <TextField fullWidth multiline rows={3} placeholder="Descreva observações do reparo..." variant="standard" />
                        </Paper>
                    </Grid>
                </Grid>

                <Button fullWidth sx={{ mt: 3, color: 'text.secondary' }} onClick={() => setActiveSO(null)}>
                    Trocar Equipamento
                </Button>
            </motion.div>
        </AnimatePresence>
      )}

      {/* Floating Action Button para acesso rápido ao estoque de peças */}
      <Fab color="secondary" sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <FaTools />
      </Fab>

      {/* Checklist Modal */}
      <Dialog open={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Checklist de Entrada
              <IconButton onClick={() => setIsChecklistOpen(false)}><FaTimes /></IconButton>
          </DialogTitle>
          <DialogContent>
              <TechnicalChecklist 
                initialData={activeSO?.entry_checklist} 
                onSave={handleSaveChecklist} 
              />
          </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TechBenchPage;

