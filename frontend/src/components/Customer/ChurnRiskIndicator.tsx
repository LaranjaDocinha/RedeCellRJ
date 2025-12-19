import React from 'react';
import { Box, Typography, Paper, CircularProgress, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Warning, SentimentNeutral, SentimentDissatisfied } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ChurnRisk {
  customerId: number;
  customerName: string;
  riskScore: number;
  status: 'low' | 'medium' | 'high';
  reason: string[];
}

interface ChurnRiskIndicatorProps {
  customerId: string;
}

const ChurnRiskIndicator: React.FC<ChurnRiskIndicatorProps> = ({ customerId }) => {
  const { t } = useTranslation();

  const { data: churnData, isLoading, error } = useQuery<ChurnRisk>({
    queryKey: ['customerChurnRisk', customerId],
    queryFn: async () => {
      const response = await axios.get(`/api/customers/${customerId}/churn-risk`);
      return response.data;
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error || !churnData) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', mt: 2 }}>
        <Typography variant="body2">{t('failed_to_load_churn_risk')}</Typography>
      </Paper>
    );
  }

  let chipColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  let chipIcon = null;
  switch (churnData.status) {
    case 'high':
      chipColor = 'error';
      chipIcon = <SentimentDissatisfied />;
      break;
    case 'medium':
      chipColor = 'warning';
      chipIcon = <Warning />;
      break;
    case 'low':
    default:
      chipColor = 'success';
      chipIcon = <SentimentNeutral />;
      break;
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">{t('churn_risk')}</Typography>
      <Box display="flex" alignItems="center" mt={1}>
        <Chip 
          label={`${t('risk_level')}: ${t(churnData.status)} (${churnData.riskScore}%)`} 
          color={chipColor} 
          icon={chipIcon} 
          sx={{ mr: 1 }} 
        />
        <Typography variant="body2" color="textSecondary">
          {churnData.reason.join(', ')}
        </Typography>
      </Box>
      {churnData.status !== 'low' && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {t('churn_risk_action_suggestion')}
        </Typography>
      )}
    </Paper>
  );
};

export default ChurnRiskIndicator;
