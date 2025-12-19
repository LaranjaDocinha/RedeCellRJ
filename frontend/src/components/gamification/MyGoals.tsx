import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, List, ListItem, ListItemText, LinearProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface GoalProgress {
  goal: any;
  achieved_value: number;
  progress: number;
}

const MyGoals: React.FC = () => {
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchGoals = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/sales-goals/progress/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error('Error fetching goal progress:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [token]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Minhas Metas Ativas</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {goals.length === 0 ? (
              <Typography>Nenhuma meta ativa no momento.</Typography>
            ) : (
              goals.map((item) => (
                <ListItem key={item.goal.id}>
                  <ListItemText
                    primary={item.goal.name}
                    secondary={`Progresso: ${item.achieved_value.toLocaleString()} / ${item.goal.target_value.toLocaleString()} (${item.progress}%)`}
                  />
                  <Box width="100%" ml={4}>
                    <LinearProgress variant="determinate" value={item.progress > 100 ? 100 : item.progress} />
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default MyGoals;
