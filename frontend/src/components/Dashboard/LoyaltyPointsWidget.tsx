import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { Star } from '@mui/icons-material';

interface LoyaltyPointsWidgetProps {
  data: {
    loyaltyPoints?: number;
  };
}

const LoyaltyPointsWidget: React.FC<LoyaltyPointsWidgetProps> = ({ data }) => {
  const points = data?.loyaltyPoints || 0;

  return (
    <Paper sx={{ p: 3, borderRadius: '16px', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Pontos de Fidelidade
      </Typography>
      
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Star sx={{ fontSize: 40, color: 'warning.main' }} />
        <Typography variant="h3" sx={{ fontWeight: 400, color: 'primary.main' }}>
          {points}
        </Typography>
      </Box>
      
      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', mt: 1 }}>
        Média de engajamento dos clientes
      </Typography>
    </Paper>
  );
};

export default LoyaltyPointsWidget;

