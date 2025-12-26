import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import DashboardWidgetSkeleton from './DashboardWidgetSkeleton';

/**
 * @function DashboardPageSkeleton
 * @description Componente de skeleton para a página completa do Dashboard, exibido durante o carregamento inicial.
 * @returns {React.FC} O componente DashboardPageSkeleton.
 */
const DashboardPageSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          padding: (theme) => theme.spacing(3),
          margin: '0 auto',
          maxWidth: 1200,
        }}
      >
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: { xs: 2, sm: 0 } }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}>
            <Skeleton variant="rectangular" width={150} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
            <Skeleton variant="rectangular" width={100} height={40} />
            <Skeleton variant="rectangular" width={180} height={40} />
          </Box>
        </Box>

        {/* Widgets Skeleton */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DashboardWidgetSkeleton />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <DashboardWidgetSkeleton />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <DashboardWidgetSkeleton />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <DashboardWidgetSkeleton />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <DashboardWidgetSkeleton />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <DashboardWidgetSkeleton />
          </Grid>
        </Grid>

        {/* Activity Feed Skeleton */}
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} />
        </Box>
      </Box>
    </motion.div>
  );
};

export default DashboardPageSkeleton;
