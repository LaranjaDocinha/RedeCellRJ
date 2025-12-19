import React from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';

// Mock data
const trackingSteps = [
    { status: 'Pedido Realizado', date: '20/09/2025 10:30', icon: <CheckCircleIcon />, color: 'success' },
    { status: 'Pagamento Aprovado', date: '20/09/2025 10:32', icon: <CheckCircleIcon />, color: 'success' },
    { status: 'Em Separação', date: '21/09/2025 09:00', icon: <CheckCircleIcon />, color: 'success' },
    { status: 'Enviado para a Transportadora', date: '22/09/2025 18:00', icon: <LocalShippingIcon />, color: 'primary' },
    { status: 'Saiu para Entrega', date: '23/09/2025 08:00', icon: <LocalShippingIcon />, color: 'primary' },
    { status: 'Entregue', date: null, icon: <HomeIcon /> },
];

const OrderTrackingPage = () => {
  return (
    <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Rastrear Pedido</Typography>
        <Paper sx={{ p: 3, mb: 4, borderRadius: '16px', display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField label="Código de Rastreio" variant="outlined" fullWidth defaultValue="#12345" />
            <Button variant="contained" size="large">Buscar</Button>
        </Paper>

        <Timeline position="alternate">
            {trackingSteps.map((step, index) => (
                <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                        {step.date}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot color={(step.color as any) || 'grey'}>
                            {step.icon}
                        </TimelineDot>
                        {index < trackingSteps.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>{step.status}</TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    </Box>
  );
};

export default OrderTrackingPage;