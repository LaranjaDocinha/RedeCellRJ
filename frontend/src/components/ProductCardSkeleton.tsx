import React from 'react';
import { Box, Skeleton } from '@mui/material';

const ProductCardSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Skeleton variant="rectangular" width="100%" height={120} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Skeleton variant="rectangular" width={80} height={30} />
        <Skeleton variant="rectangular" width={80} height={30} />
      </Box>
    </Box>
  );
};

export default ProductCardSkeleton;
