import React, { useState } from 'react';
import { Box, Typography, Avatar, LinearProgress, Paper, Grid, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import md5 from 'md5'; // Ensure md5 is installed or use a simple hash function

// Helper to get Gravatar
const getGravatarUrl = (email: string) => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};

interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  total: number;
  xp: number;
  level: number;
}

const GamificationLeaderboard: React.FC = () => {
  const { token } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<'sales_volume' | 'repairs_completed'>('sales_volume');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('monthly');


  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['gamificationLeaderboard', selectedMetric, selectedPeriod], // Adicionar metric e period ao queryKey
    queryFn: async () => {
      const response = await axios.get(`/api/gamification/leaderboard?metric=${selectedMetric}&period=${selectedPeriod}`, { // Usar metric e period
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token,
  });

  const handleMetricChange = (event: SelectChangeEvent<'sales_volume' | 'repairs_completed'>) => {
    setSelectedMetric(event.target.value as 'sales_volume' | 'repairs_completed');
  };

  const handlePeriodChange = (event: SelectChangeEvent<'daily' | 'weekly' | 'monthly' | 'all_time'>) => {
    setSelectedPeriod(event.target.value as 'daily' | 'weekly' | 'monthly' | 'all_time');
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Ranking</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Métrica</InputLabel>
          <Select value={selectedMetric} label="Métrica" onChange={handleMetricChange}>
            <MenuItem value="sales_volume">Volume de Vendas</MenuItem>
            <MenuItem value="repairs_completed">Reparos Concluídos</MenuItem>
            {/* Adicionar mais métricas conforme expandirmos o backend */}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Período</InputLabel>
          <Select value={selectedPeriod} label="Período" onChange={handlePeriodChange}>
            <MenuItem value="daily">Diário</MenuItem>
            <MenuItem value="weekly">Semanal</MenuItem>
            <MenuItem value="monthly">Mensal</MenuItem>
            <MenuItem value="all_time">Total</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {leaderboard?.map((user, index) => (
          <Grid item xs={12} key={user.id}> {/* Removido sm, md, lg para layout mais simples */}
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: index === 0 ? '2px solid gold' : '1px solid #eee',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Rank Badge */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bgcolor: index === 0 ? 'gold' : (index === 1 ? 'silver' : (index === 2 ? '#cd7f32' : '#eee')),
                color: index < 3 ? 'white' : 'black',
                px: 1,
                borderBottomRightRadius: 8,
                fontWeight: 'bold'
              }}>
                #{index + 1}
              </Box>

              <Avatar
                src={getGravatarUrl(user.email || 'default')}
                sx={{ width: 64, height: 64, border: '2px solid white', boxShadow: 1 }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary">Nível {user.level}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(user.xp % 100)} // Example progress within level
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption">{user.xp} XP</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GamificationLeaderboard;