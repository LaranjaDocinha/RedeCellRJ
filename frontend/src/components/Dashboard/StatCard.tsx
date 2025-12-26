import React from 'react';
import { Paper, Box, Typography, Avatar, Skeleton, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon, color, delay = 0, loading = false }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Paper sx={{ 
        p: 2, 
        borderRadius: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        boxShadow: isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
        border: `1px solid ${theme.palette.divider}`,
        height: '90px',
        bgcolor: theme.palette.background.paper,
        backgroundImage: 'none'
      }}>
        {loading ? (
          <>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={30} />
            </Box>
          </>
        ) : (
          <>
            <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400, textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400 }}>
                {value}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </motion.div>
  );
});

export default StatCard;