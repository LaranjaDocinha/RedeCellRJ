import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <SearchOffIcon sx={{ fontSize: 80 }} />,
  title,
  message,
  actionButtonLabel,
  onActionButtonClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 4,
          color: 'text.secondary',
        }}
      >
        <Box sx={{ mb: 2 }}>{icon}</Box>
        <Typography variant="h5" component="p" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {message}
        </Typography>
        {actionButtonLabel && onActionButtonClick && (
          <Button label={actionButtonLabel} onClick={onActionButtonClick} primary />
        )}
      </Box>
    </motion.div>
  );
};