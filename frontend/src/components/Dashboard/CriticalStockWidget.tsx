import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper, Avatar, useTheme, alpha } from '@mui/material';
import { Inventory, Warning } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface CriticalStockWidgetProps {
  data: {
    criticalStock?: Array<{
      id: number;
      name: string;
      currentStock: number;
      criticalLimit: number;
    }>;
  };
  loading?: boolean;
}

const CriticalStockWidget: React.FC<CriticalStockWidgetProps> = ({ data, loading = false }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const stockItems = data?.criticalStock || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
      <Paper sx={{ 
        p: 3, 
        borderRadius: '24px', 
        height: '100%', 
        boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.04)', 
        display: 'flex', 
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        backgroundImage: 'none'
      }}>
        <Typography variant="overline" sx={{ fontWeight: 400, color: 'text.secondary', mb: 2, display: 'block', letterSpacing: 1 }}>
          Estoque Crítico
        </Typography>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {stockItems.length > 0 ? (
            <List disablePadding>
              {stockItems.map((item, index) => (
                <React.Fragment key={`critical-${item.id}-${index}`}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mr: 2, width: 40, height: 40 }}>
                      <Inventory fontSize="small" />
                    </Avatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 400, color: 'text.primary' }}>{item.name}</Typography>}
                      secondary={
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 400 }}>
                          Restam apenas {item.currentStock} unidades
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < stockItems.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <Warning sx={{ fontSize: 48, color: 'success.light', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 400 }}>Estoque sob controle</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default CriticalStockWidget;