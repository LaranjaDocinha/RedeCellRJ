import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface Challenge {
  id: number;
  title: string;
  description: string;
  metric: string;
  target_value: number;
  current_value: number;
  reward_xp: number;
  completed: boolean;
  end_date: string;
}

const ActiveChallengesWidget: React.FC = () => {
  const { token } = useAuth();
  const { t } = useTranslation();

  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ['myChallenges'],
    queryFn: async () => {
      const response = await axios.get('/api/gamification/my-challenges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token,
  });

  if (isLoading) return <LinearProgress />;
  if (!challenges || challenges.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Desafios da Semana</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {challenges.map(challenge => {
            const progress = Math.min((challenge.current_value / challenge.target_value) * 100, 100);
            return (
              <Box key={challenge.id} sx={{ border: '1px solid #eee', p: 1.5, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>{challenge.title}</Typography>
                  <Chip 
                    label={`+${challenge.reward_xp} XP`} 
                    size="small" 
                    color={challenge.completed ? 'success' : 'primary'} 
                    variant={challenge.completed ? 'filled' : 'outlined'}
                  />
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  {challenge.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress variant="determinate" value={progress} color={challenge.completed ? 'success' : 'primary'} />
                  </Box>
                  <Typography variant="caption" sx={{ minWidth: 35 }}>{Math.round(progress)}%</Typography>
                </Box>
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  {challenge.current_value} / {challenge.target_value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActiveChallengesWidget;

