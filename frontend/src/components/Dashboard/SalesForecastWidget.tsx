import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AnimatedCounter from '../AnimatedCounter';

const SalesForecastWidget: React.FC<{ data: any }> = ({ data }) => {
  const { t } = useTranslation();

  if (!data) return null;

  const progress = Math.min((data.current_sales / data.projected_sales) * 100, 100);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('sales_forecast')}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">{t('current_sales')}</Typography>
          <Typography variant="h5" color="primary">
            R$ <AnimatedCounter value={data.current_sales} />
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">{t('projected_sales_end_month')}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            R$ <AnimatedCounter value={data.projected_sales} />
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={progress} color="secondary" />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="textSecondary">{`${Math.round(progress)}%`}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesForecastWidget;
