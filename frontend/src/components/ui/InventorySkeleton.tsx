import React from 'react';
import { Grid, Box, Paper, Container } from '@mui/material';
import SkeletonLoader from '../SkeletonLoader';

const InventorySkeleton: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* Top Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
            <SkeletonLoader width="150px" height="40px" />
            <SkeletonLoader width="250px" height="20px" sx={{ mt: 1 }} />
        </Box>
        <SkeletonLoader width="120px" height="40px" />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, md: 4 }} key={i}>
            <Paper sx={{ p: 3, borderRadius: '24px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <SkeletonLoader width="100px" height="30px" />
                <SkeletonLoader width="50px" height="50px" variant="circle" />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search Bar */}
      <SkeletonLoader width="100%" height="56px" sx={{ mb: 3, borderRadius: '12px' }} />

      {/* Table Area */}
      <Paper sx={{ p: 2, borderRadius: '24px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonLoader key={i} width="100%" height="60px" sx={{ mb: 1 }} />
        ))}
      </Paper>
    </Container>
  );
};

export default InventorySkeleton;
