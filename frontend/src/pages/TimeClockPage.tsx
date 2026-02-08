import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Chip, 
  Divider, 
  Stack, 
  useTheme,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
  Button as MuiButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  AccessTime as ClockIcon, 
  Login as InIcon, 
  Logout as OutIcon, 
  LocationOn as LocationIcon,
  CheckCircle as OnTimeIcon,
  AccessTimeFilled as PendingIcon,
  Timeline as TimelineIcon,
  CalendarToday,
  History,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import ErrorBoundary from '../components/ErrorBoundary';
import { FaArrowRight } from 'react-icons/fa';

const TimeClockPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { token } = useAuth();
  const { addNotification } = useNotification();
  
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  // 1. Fetch Initial Status
  const fetchClockStatus = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Get latest entry to check if user is clocked in
      const latestRes = await fetch('/api/time-clock/me/latest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (latestRes.status === 200) {
        const entry = await latestRes.json();
        const active = entry && entry.clock_in_time && !entry.clock_out_time;
        setIsClockedIn(active);
        if (active) setSessionStartTime(entry.clock_in_time);
      } else {
        setIsClockedIn(false);
      }

      // Get history for the timeline
      const historyRes = await fetch('/api/time-clock/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const data = await historyRes.json();
        setRecentEntries(data.slice(0, 5));
      }
    } catch (error) {
      addNotification('Erro ao sincronizar status do ponto.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addNotification]);

  useEffect(() => { fetchClockStatus(); }, [fetchClockStatus]);

  // 2. Clock Update Timer using native Date
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  };

  const handleReportClick = () => {
    addNotification('Gerando relatório de ponto...', 'info');
    // Futura implementação: navegar para página de relatórios ou abrir modal
  };

  const handleJustifyClick = () => {
    addNotification('Funcionalidade de justificativa em breve.', 'info');
    // Futura implementação: abrir modal de justificativa
  };

  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  // 3. Handle Clock In/Out
  const handleClockAction = async () => {
    setActionLoading(true);
    
    // Captura Localização
    let currentCoords = null;
    try {
        const pos: any = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(currentCoords);
    } catch (e) {
        addNotification('Acesso à localização negado. O ponto será registrado com alerta.', 'warning');
    }

    const endpoint = isClockedIn ? '/api/v1/time-clock/clock-out' : '/api/v1/time-clock/clock-in';
    const payload = isClockedIn ? { location: currentCoords } : { branchId: 1, location: currentCoords }; 

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Falha na operação');

      addNotification(`Ponto de ${!isClockedIn ? 'entrada' : 'saída'} registrado!`, 'success');
      fetchClockStatus(); // Refresh everything
    } catch (error: any) {
      addNotification(error.message || 'Erro ao registrar ponto.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const sessionDuration = useMemo(() => {
    if (!isClockedIn || !sessionStartTime) return null;
    const start = new Date(sessionStartTime).getTime();
    const current = now.getTime();
    const diff = current - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }, [now, isClockedIn, sessionStartTime]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress size={40} thickness={4} />
    </Box>
  );

  return (
    <ErrorBoundary>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: '0 auto' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 400, letterSpacing: '-0.5px' }}>Terminal de Ponto</Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, opacity: 0.7 }}>
                <LocationIcon size="small" />
                <Typography variant="body2" sx={{ fontWeight: 400 }}>Filial Rio de Janeiro - Matriz</Typography>
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="inherit" label="Relatório" startIcon={<CalendarToday />} onClick={handleReportClick} />
            <Button variant="outlined" color="inherit" label="Justificar" startIcon={<PendingIcon />} onClick={handleJustifyClick} />
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper 
                elevation={0}
                sx={{ 
                    p: 5, borderRadius: '32px', textAlign: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                    background: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : '#ffffff',
                    position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}
            >
              <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.05), filter: 'blur(40px)' }} />
              <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 3, mb: 2, fontWeight: 400 }}>HORÁRIO ATUAL</Typography>
              <Box sx={{ position: 'relative', mb: 4 }}>
                <Typography variant="h1" sx={{ fontWeight: 400, fontSize: { xs: '4rem', md: '6rem' }, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-2px' }}>
                    {formatDate(now, { hour: '2-digit', minute: '2-digit' })}
                    <Typography component="span" variant="h4" sx={{ ml: 1, opacity: 0.3, fontWeight: 400 }}>
                      {formatDate(now, { second: '2-digit' })}
                    </Typography>
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, textTransform: 'capitalize' }}>
                  {formatDate(now, { weekday: 'long', day: 'numeric', month: 'long' })}
                </Typography>
              </Box>

              <Box sx={{ position: 'relative', mb: 6 }}>
                <motion.div animate={{ scale: isClockedIn ? [1, 1.03, 1] : 1 }} transition={{ repeat: Infinity, duration: 4 }}>
                    <MuiButton
                        disabled={actionLoading}
                        onClick={handleClockAction}
                        sx={{
                            width: 240, height: 240, borderRadius: '50%',
                            border: `2px solid ${isClockedIn ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2)}`,
                            display: 'flex', flexDirection: 'column', gap: 1,
                            bgcolor: isClockedIn ? alpha(theme.palette.error.main, 0.02) : alpha(theme.palette.success.main, 0.02),
                            transition: 'all 0.4s',
                            '&:hover': {
                                bgcolor: isClockedIn ? alpha(theme.palette.error.main, 0.08) : alpha(theme.palette.success.main, 0.08),
                                transform: 'translateY(-5px)',
                                boxShadow: `0 20px 40px ${isClockedIn ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1)}`
                            }
                        }}
                    >
                        {actionLoading ? <CircularProgress color={isClockedIn ? "error" : "success"} /> : (
                            <>
                                {isClockedIn ? <OutIcon sx={{ fontSize: 48, color: 'error.main' }} /> : <InIcon sx={{ fontSize: 48, color: 'success.main' }} />}
                                <Typography variant="h6" sx={{ fontWeight: 400, color: isClockedIn ? 'error.main' : 'success.main' }}>{isClockedIn ? 'REGISTRAR SAÍDA' : 'REGISTRAR ENTRADA'}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.6, textTransform: 'none' }}>Toque para confirmar</Typography>
                            </>
                        )}
                    </MuiButton>
                </motion.div>
              </Box>

              <Box sx={{ width: '100%', p: 2, borderRadius: '16px', bgcolor: isDarkMode ? alpha('#fff', 0.03) : '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isClockedIn ? 'success.main' : 'error.main', boxShadow: `0 0 10px ${isClockedIn ? theme.palette.success.main : theme.palette.error.main}` }} />
                <Typography variant="body2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
                    {isClockedIn ? `Sessão ativa há ${sessionDuration}` : 'Sistema aguardando registro'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={4}>
              <Paper variant="outlined" sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box><Typography variant="subtitle1" sx={{ fontWeight: 400 }}>Meta Semanal</Typography><Typography variant="caption" color="text.secondary">Jornada de 44h</Typography></Box>
                    <Chip label="75% CONCLUÍDO" size="small" variant="outlined" sx={{ fontWeight: 400 }} color="primary" />
                </Box>
                <Box sx={{ position: 'relative', pt: 1 }}>
                    <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                    <Box display="flex" justifyContent="space-between" mt={1.5}><Typography variant="h5" sx={{ fontWeight: 400 }}>33h 15m</Typography><Typography variant="body2" color="text.secondary">Faltam 10h 45m</Typography></Box>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 4, borderRadius: '32px', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Stack direction="row" spacing={1.5} alignItems="center"><History color="primary" /><Typography variant="h6" sx={{ fontWeight: 400 }}>Histórico Recente</Typography></Stack>
                </Box>

                <Box sx={{ position: 'relative', pl: 4, borderLeft: `2px dashed ${theme.palette.divider}`, ml: 2 }}>
                    <AnimatePresence>
                        {recentEntries.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Nenhum registro encontrado esta semana.</Typography>
                        ) : recentEntries.map((entry, idx) => (
                            <Box key={entry.id} component={motion.div} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} sx={{ position: 'relative', mb: 3 }}>
                                <Box sx={{ position: 'absolute', left: -41, top: 4, width: 16, height: 16, borderRadius: '50%', bgcolor: theme.palette.background.paper, border: `3px solid ${theme.palette.primary.main}`, zIndex: 1 }} />
                                <Grid container alignItems="center">
                                    <Grid size={{ xs: 4, sm: 3 }}><Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(entry.clock_in_time))}
                                    </Typography></Grid>
                                    <Grid size={{ xs: 8, sm: 9 }}>
                                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: isDarkMode ? alpha('#fff', 0.02) : '#fbfbfb', border: `1px solid ${theme.palette.divider}` }}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">
                                                  {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(entry.clock_in_time))} - 
                                                  {entry.clock_out_time ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(entry.clock_out_time)) : '...'}
                                                </Typography>
                                                <OnTimeIcon sx={{ color: 'success.main', fontSize: 16 }} />
                                            </Stack>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </AnimatePresence>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box display="flex" justifyContent="center"><Button variant="text" label="Ver espelho completo" endIcon={<FaArrowRight />} sx={{ fontWeight: 400 }} /></Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

export default TimeClockPage;