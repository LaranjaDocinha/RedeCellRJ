import React from 'react';
import { Box, Skeleton } from '@mui/material'; // Import Box and Skeleton from MUI

/**
 * @function DashboardWidgetSkeleton
 * @description Componente de esqueleto de carregamento para widgets do dashboard.
 * @returns {React.FC} O componente DashboardWidgetSkeleton.
 */
const DashboardWidgetSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: (theme) => theme.borderRadius.medium,
        boxShadow: (theme) => theme.shadows.elevation1,
        padding: (theme) => theme.spacing(2), // Equivalent to theme.spacing.md
        height: '100%', // Ensure it takes full height of the widget container
        display: 'flex',
        flexDirection: 'column',
        gap: (theme) => theme.spacing(1), // Equivalent to theme.spacing.sm
      }}
    >
      <Skeleton variant="text" width="70%" height={30} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" height={150} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" height={20} />
      <Skeleton variant="text" width="50%" height={20} />
    </Box>
  );
};

export default DashboardWidgetSkeleton;
