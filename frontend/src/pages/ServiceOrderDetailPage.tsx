import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, CircularProgress, Button, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import ServiceOrderLabelModal from '../components/ServiceOrder/ServiceOrderLabelModal';
import DeviceCheckInCanvas from '../components/ServiceOrder/DeviceCheckInCanvas';

import { useSocket } from '../contexts/SocketContext';
import { Alert, AlertTitle } from '@mui/material';

const ServiceOrderDetailPage: React.FC = () => {
  const [order, setOrder] = useState<any>(null);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [visualCondition, setVisualCondition] = useState<string>(''); 
  const [ifixitGuides, setIfixitGuides] = useState<any[]>([]);
  const [lockedBy, setLockedBy] = useState<{ userId: string, userName: string } | null>(null);

  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const { socket } = useSocket();

  // Sugestão Sênior #4: Record Locking em Tempo Real
  useEffect(() => {
    if (!socket || !id || !user) return;

    // Tenta travar o registro ao entrar
    socket.emit('os_lock', { osId: id, userId: user.id, userName: user.name });

    socket.on('os_locked', ({ osId, userId, userName }) => {
        if (String(osId) === String(id) && userId !== user.id) {
            setLockedBy({ userId, userName });
        }
    });

    socket.on('os_unlocked', ({ osId }) => {
        if (String(osId) === String(id)) {
            setLockedBy(null);
        }
    });

    socket.on('os_lock_failed', () => {
        // Se falhou (já estava travado), o evento 'os_locked' vai chegar em breve ou ja chegou
    });

    return () => {
        socket.emit('os_unlock', { osId: id });
        socket.off('os_locked');
        socket.off('os_unlocked');
        socket.off('os_lock_failed');
    };
  }, [socket, id, user]);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [orderRes, logsRes, activeTimerRes, guidesRes] = await Promise.all([
          fetch(`/api/service-orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/service-orders/${id}/time-log`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/service-orders/${id}/time-log/active`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/ifixit/service-order/${id}/guides`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const orderData = await orderRes.json();
        const logsData = await logsRes.json();
        const activeTimerData = await activeTimerRes.json();
        const guidesData = await guidesRes.json();

        setOrder(orderData);
        setVisualCondition(orderData.visual_condition || '');
        setTimeLogs(logsData);
        setActiveTimer(activeTimerData);
        setIfixitGuides(Array.isArray(guidesData) ? guidesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id, token]);

  const handleSaveVisualCondition = async (data: string) => {
    if (!token) return;
    try {
      await fetch(`/api/service-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visual_condition: data })
      });
      setVisualCondition(data);
    } catch (error) {
      console.error('Error saving visual condition:', error);
    }
  };

  const handleToggleTimer = async () => {
    if (!token) return;
    const url = activeTimer ? `/api/service-orders/${id}/time-log/stop` : `/api/service-orders/${id}/time-log/start`;
    try {
      await fetch(url, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
  }

  if (!order) {
    return <Box p={3}><Typography>Ordem de Serviço não encontrada.</Typography></Box>;
  }

  const isTechnician = user?.permissions?.some((p: any) => p.subject === 'ServiceOrders' && p.action === 'update');

  return (
    <Box p={3}>
      {lockedBy && (
          <Alert severity="warning" variant="filled" sx={{ mb: 3, borderRadius: 3 }}>
              <AlertTitle>Registro Bloqueado</AlertTitle>
              Esta Ordem de Serviço está sendo editada por <strong>{lockedBy.userName}</strong>. 
              Para evitar perda de dados, suas alterações não poderão ser salvas agora.
          </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Detalhes da Ordem de Serviço #{order.id}</Typography>
        <Button variant="outlined" onClick={() => setIsLabelModalOpen(true)}>Imprimir Etiqueta</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: '16px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography><b>Cliente:</b> {order.customer_id}</Typography>
                <Typography><b>Produto:</b> {order.product_description}</Typography>
                <Typography><b>IMEI:</b> {order.imei}</Typography>
                <Typography><b>Status:</b> {order.status}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><b>Descrição do Problema:</b></Typography>
                <Typography>{order.issue_description}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: '16px' }}>
            <Typography variant="h6">Controle de Tempo</Typography>
            {isTechnician && (
              <Button variant="contained" color={activeTimer ? 'error' : 'success'} onClick={handleToggleTimer} sx={{ my: 2 }}>
                {activeTimer ? 'Parar Cronômetro' : 'Iniciar Cronômetro'}
              </Button>
            )}
            <List>
              {timeLogs.map(log => (
                <ListItem key={log.id}>
                  <ListItemText 
                    primary={`${log.user_name}`}
                    secondary={`Início: ${moment(log.start_time).format('DD/MM HH:mm')} - Fim: ${log.end_time ? moment(log.end_time).format('DD/MM HH:mm') : 'Em andamento'}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: '16px' }}>
            <DeviceCheckInCanvas 
              initialData={visualCondition} 
              onChange={handleSaveVisualCondition} 
              readOnly={!isTechnician || !!lockedBy} 
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: '16px' }}>
            <Typography variant="h6" gutterBottom>Guias de Reparo Sugeridos (iFixit)</Typography>
            {ifixitGuides.length > 0 ? (
              <List dense>
                {ifixitGuides.map((guide: any) => (
                  <ListItem key={guide.guideid} component="a" href={guide.url} target="_blank" sx={{ borderBottom: '1px solid #eee' }}>
                    {guide.image && <img src={guide.image.thumbnail} alt="" style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }} />}
                    <ListItemText primary={guide.title} secondary={guide.summary} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">Nenhum guia encontrado para o modelo "{order?.product_description}".</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {order && (
        <ServiceOrderLabelModal 
          open={isLabelModalOpen} 
          onClose={() => setIsLabelModalOpen(false)} 
          serviceOrder={order} 
        />
      )}
    </Box>
  );
};
export default ServiceOrderDetailPage;