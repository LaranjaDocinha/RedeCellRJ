import React, { useEffect } from 'react';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const KioskDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  // Reuse dashboard loader data if possible, or fetch fresh
  const { totalSales } = useLoaderData() as any || { totalSales: { mainPeriodSales: 0 } };

  useEffect(() => {
    // Auto-refresh every 60s
    const timer = setInterval(() => {
        navigate('.', { replace: true });
    }, 60000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: 'black', color: 'white', p: 4, overflow: 'hidden' }}>
      <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase' }}>
        Metas do Dia
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 4, height: '80%' }}>
        <Grid item xs={6}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#1a1a1a', color: theme.palette.success.main, borderRadius: 8 }}>
                <Typography variant="h5" sx={{ opacity: 0.7 }}>VENDAS TOTAIS</Typography>
                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <Typography variant="h1" sx={{ fontWeight: 'bold', fontSize: '6rem' }}>
                        R$ {Number(totalSales?.mainPeriodSales || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </Typography>
                </motion.div>
            </Paper>
        </Grid>
        <Grid item xs={6}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#1a1a1a', color: theme.palette.primary.main, borderRadius: 8 }}>
                <Typography variant="h5" sx={{ opacity: 0.7 }}>OS FINALIZADAS</Typography>
                <Typography variant="h1" sx={{ fontWeight: 'bold', fontSize: '6rem' }}>
                    12
                </Typography>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KioskDashboardPage;
