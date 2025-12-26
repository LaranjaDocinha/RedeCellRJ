import React from 'react';
import { CircularProgress, Box } from '@mui/material';

export interface LoadingSpinnerProps {
  fullscreen?: boolean;
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullscreen = false,
  size = 40,
}) => {
  if (fullscreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999,
        }}
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;
