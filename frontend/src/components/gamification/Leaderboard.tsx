import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('sales_volume');
  const { token } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/gamification/leaderboard?metric=${metric}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [token, metric]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Leaderboard</Typography>
        <FormControl fullWidth sx={{ my: 2 }}>
          <InputLabel>Métrica</InputLabel>
          <Select value={metric} label="Métrica" onChange={(e) => setMetric(e.target.value)}>
            <MenuItem value="sales_volume">Volume de Vendas</MenuItem>
            <MenuItem value="repairs_completed">Reparos Concluídos</MenuItem>
          </Select>
        </FormControl>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {leaderboard.map((user, index) => (
              <ListItem key={user.id}>
                <ListItemText primary={`${index + 1}. ${user.name}`} secondary={`Total: ${metric === 'sales_volume' ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(user.total) : user.total}`} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
