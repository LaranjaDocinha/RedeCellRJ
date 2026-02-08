import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Avatar, 
  Stack, 
  LinearProgress,
  alpha,
  useTheme,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaStar, FaBolt, FaLock, FaMedal } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import confetti from 'canvas-confetti';

const GamificationPage: React.FC = () => {
  const theme = useTheme();
  const { token, user } = useAuth();
  
  // Efeito de confete para demonstração
  const triggerLevelUp = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [theme.palette.primary.main, theme.palette.secondary.main, '#FFD700']
    });
  };

  const { data: badges } = useQuery({
    queryKey: ['userBadges'],
    queryFn: async () => {
      // Mock de badges para visualização
      return [
        { id: 1, name: 'Mestre dos Reparos', description: 'Completou 100 OS', icon: <FaMedal />, unlocked: true },
        { id: 2, name: 'Vendedor Águia', description: 'Bateu a meta 3x seguidas', icon: <FaBolt />, unlocked: true },
        { id: 3, name: 'Atendimento de Elite', description: 'Nota 5.0 em 50 avaliações', icon: <FaStar />, unlocked: false },
        { id: 4, name: 'Scanner Humano', description: 'Identificou 10 IMEIs seguidos', icon: <FaTrophy />, unlocked: false },
      ];
    }
  });

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={{ p: 6, borderRadius: '32px', bgcolor: theme.palette.primary.main, color: 'white', mb: 6, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
                <FaTrophy size={300} />
            </Box>
            
            <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                    <motion.div whileHover={{ scale: 1.05 }} onClick={triggerLevelUp} style={{ cursor: 'pointer' }}>
                        <Avatar sx={{ width: 150, height: 150, bgcolor: 'rgba(255,255,255,0.2)', border: '8px solid rgba(255,255,255,0.3)', mx: 'auto', fontSize: '4rem', fontWeight: 400 }}>
                            12
                        </Avatar>
                        <Typography variant="h6" fontWeight={400} mt={2}>NÍVEL ATUAL</Typography>
                    </motion.div>
                </Grid>
                <Grid item xs={12} md={9}>
                    <Typography variant="h3" fontWeight={400} gutterBottom>Quase lá, {user?.name?.split(' ')[0]}!</Typography>
                    <Typography variant="h6" sx={{ opacity: 0.8, mb: 4 }}>Você está a apenas <strong>450 XP</strong> de se tornar um <strong>Técnico Lendário (Lvl 13)</strong>.</Typography>
                    
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Progresso do Nível</Typography>
                            <Typography variant="body2" fontWeight={400}>85% (2550 / 3000 XP)</Typography>
                        </Stack>
                        <LinearProgress 
                            variant="determinate" 
                            value={85} 
                            sx={{ height: 16, borderRadius: 8, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#FFD700' } }} 
                        />
                    </Box>
                </Grid>
            </Grid>
        </Paper>
      </motion.div>

      <Grid container spacing={4}>
        {/* Badges / Conquistas */}
        <Grid item xs={12} lg={8}>
            <Typography variant="h5" fontWeight={400} mb={3}>Minhas Conquistas</Typography>
            <Grid container spacing={2}>
                {badges?.map((badge) => (
                    <Grid item xs={12} sm={6} key={badge.id}>
                        <motion.div whileHover={{ y: -5 }}>
                            <Paper sx={{ p: 3, borderRadius: '24px', display: 'flex', alignItems: 'center', gap: 3, opacity: badge.unlocked ? 1 : 0.6, border: badge.unlocked ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent' }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: badge.unlocked ? alpha(theme.palette.primary.main, 0.1) : 'action.disabledBackground', color: badge.unlocked ? theme.palette.primary.main : 'text.disabled' }}>
                                    {badge.unlocked ? badge.icon : <FaLock />}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={400}>{badge.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{badge.description}</Typography>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Grid>

        {/* Ranking */}
        <Grid item xs={12} lg={4}>
            <Typography variant="h5" fontWeight={400} mb={3}>Leaderboard Semanal</Typography>
            <Paper sx={{ p: 3, borderRadius: '24px' }}>
                <Stack spacing={2}>
                    {[
                        { name: 'Marcos Oliveira', xp: 4500, rank: 1, color: '#FFD700' },
                        { name: 'Você', xp: 2550, rank: 2, color: '#C0C0C0' },
                        { name: 'Ana Souza', xp: 2100, rank: 3, color: '#CD7F32' },
                        { name: 'Ricardo Lima', xp: 1800, rank: 4, color: 'transparent' },
                    ].map((player, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '16px', bgcolor: player.name === 'Você' ? alpha(theme.palette.primary.main, 0.05) : 'transparent' }}>
                            <Typography variant="h6" fontWeight={400} sx={{ width: 20, color: player.color !== 'transparent' ? player.color : 'text.disabled' }}>{player.rank}</Typography>
                            <Avatar sx={{ width: 40, height: 40, fontSize: '0.9rem' }}>{player.name[0]}</Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" fontWeight={400}>{player.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{player.xp} XP</Typography>
                            </Box>
                            {player.rank === 1 && <FaTrophy color="#FFD700" />}
                        </Box>
                    ))}
                </Stack>
                <Button fullWidth sx={{ mt: 3, fontWeight: 400 }}>Ver Ranking Global</Button>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GamificationPage;

