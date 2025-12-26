import React from 'react';
import { List, ListItem, ListItemText, Typography, Divider, Box, Paper, Avatar, useTheme, alpha } from '@mui/material';
import { ShoppingCart, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface RecentSalesWidgetProps {
  data: any;
  loading?: boolean;
}

const RecentSalesWidget: React.FC<RecentSalesWidgetProps> = ({ data, loading = false }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const recentSales = data?.recentSales?.mainPeriodRecentSales || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', width: '100%' }}>
      <Paper sx={{ 
        p: 3, borderRadius: '24px', height: '100%', minHeight: '400px',
        boxShadow: isDarkMode ? 'none' : '0 10px 40px rgba(0,0,0,0.04)', 
        display: 'flex', flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        boxSizing: 'border-box'
      }}>
        <Typography variant="overline" sx={{ fontWeight: 400, color: 'text.secondary', mb: 2, letterSpacing: 1 }}>
          Atividade Recente
        </Typography>

        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {recentSales.length > 0 ? (
            <List disablePadding>
              {recentSales.slice(0, 5).map((sale: any, index: number) => (
                <React.Fragment key={sale.id}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 2, width: 40, height: 40, fontWeight: 400 }}>
                      {sale.customer_name?.[0] || <Person />}
                    </Avatar>
                    <ListItemText
                      primary={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ fontWeight: 400, color: 'text.primary' }}>Venda #{sale.id}</Typography><Typography variant="body2" sx={{ fontWeight: 400, color: 'success.main' }}>R$ {Number(sale.total_amount).toFixed(2)}</Typography></Box>}
                      secondary={<Typography variant="caption" color="text.disabled" sx={{ fontWeight: 400 }}>{new Date(sale.sale_date).toLocaleTimeString('pt-BR')} • {new Date(sale.sale_date).toLocaleDateString('pt-BR')}</Typography>}
                    />
                  </ListItem>
                  {index < 4 && <Divider sx={{ opacity: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <ShoppingCart sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 400 }}>Nenhuma venda</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default RecentSalesWidget;