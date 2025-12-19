import React, { useState } from 'react'; // Added useState
import { Box, Typography, Grid, Button } from '@mui/material'; // Added Button
import GamificationLeaderboard from '../components/Gamification/GamificationLeaderboard';
import MyBadges from '../components/gamification/MyBadges';
import MyGoals from '../components/gamification/MyGoals';
import ActiveChallengesWidget from '../components/Gamification/ActiveChallengesWidget';
import CreateChallengeModal from '../components/Gamification/CreateChallengeModal'; // Added import

const GamificationPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Added state

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Gamificação e Metas
        </Typography>
        <Button variant="contained" onClick={() => setIsCreateModalOpen(true)}>
          Criar Desafio
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ActiveChallengesWidget />
          <Box mt={3}>
            <MyGoals />
          </Box>
          <Box mt={3}>
            <MyBadges />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <GamificationLeaderboard />
        </Grid>
      </Grid>

      <CreateChallengeModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => window.location.reload()} // Simple reload to refresh data
      />
    </Box>
  );
};

export default GamificationPage;
