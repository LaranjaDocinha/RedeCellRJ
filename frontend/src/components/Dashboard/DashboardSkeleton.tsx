import React from 'react';
import { Box, Grid, Paper, Stack } from '@mui/material';
import SkeletonLoader from '../SkeletonLoader';

const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header Skeleton */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <SkeletonLoader width="250px" height="40px" />
          <SkeletonLoader width="350px" height="20px" className="mt-2" />
        </Box>
        <Stack direction="row" spacing={2}>
          <SkeletonLoader width="150px" height="40px" />
          <SkeletonLoader width="120px" height="40px" />
        </Stack>
      </Stack>

      {/* Stats Cards Skeleton */}
      <Grid container spacing={3} mb={4}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, md: 3 }} key={i}>
            <Paper sx={{ p: 3, borderRadius: '24px' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <SkeletonLoader width="80px" height="15px" />
                  <SkeletonLoader width="120px" height="35px" className="mt-2" />
                </Box>
                <SkeletonLoader width="48px" height="48px" variant="circle" />
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: '24px', height: '400px' }}>
            <SkeletonLoader width="150px" height="25px" mb={3} />
            <SkeletonLoader width="100%" height="300px" />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: '24px', height: '400px' }}>
            <SkeletonLoader width="150px" height="25px" mb={3} />
            <SkeletonLoader width="100%" height="300px" />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton;
