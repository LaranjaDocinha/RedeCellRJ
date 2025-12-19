import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { FaServer, FaCubes, FaArrowRight } from 'react-icons/fa';

const MicroservicesPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Migração para Microserviços</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Esta página representa o futuro da nossa arquitetura de sistema. Atualmente, operamos com uma arquitetura monolítica, onde todas as funcionalidades estão agrupadas em uma única aplicação. No entanto, para melhorar a escalabilidade, resiliência e agilidade no desenvolvimento, planejamos migrar para uma arquitetura de microserviços.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          A migração para microserviços envolverá a extração de módulos complexos e independentes em serviços menores e autônomos. Isso permitirá que cada serviço seja desenvolvido, implantado e escalado de forma independente, otimizando o desempenho e facilitando a manutenção.
        </Typography>

        <Grid container spacing={3} alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
          <Grid item xs={12} md={4} textAlign="center">
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent>
                <FaServer size={60} color="#1976d2" />
                <Typography variant="h6" sx={{ mt: 2 }}>Arquitetura Atual</Typography>
                <Typography variant="body2">Monolítica</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={1} textAlign="center">
            <FaArrowRight size={40} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Card variant="outlined" sx={{ p: 2 }}>
              <CardContent>
                <FaCubes size={60} color="#388e3c" />
                <Typography variant="h6" sx={{ mt: 2 }}>Arquitetura Futura</Typography>
                <Typography variant="body2">Microserviços</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Módulos Potenciais para Microserviços:</Typography>
        <ul>
          <li><Typography variant="body1">Módulo de Notificações (Email, SMS, Push)</Typography></li>
          <li><Typography variant="body1">Módulo de Relatórios e BI</Typography></li>
          <li><Typography variant="body1">Módulo de Processamento de Pagamentos</Typography></li>
          <li><Typography variant="body1">Módulo de Gestão de Estoque</Typography></li>
          <li><Typography variant="body1">Módulo de CRM e Fidelidade</Typography></li>
        </ul>
      </Paper>
    </Box>
  );
};

export default MicroservicesPage;
