import React, { useState } from 'react';
import { 
  Badge, IconButton, Popover, List, ListItem, ListItemText, 
  Typography, Box, Divider, Button, ListItemAvatar, Avatar 
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  NotificationsNone, 
  ShoppingCart, 
  Build, 
  Info, 
  CheckCircle 
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { WhatsApp } from '@mui/icons-material';

const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.metadata?.action === 'google_review_prompt') return;
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  };

  const handleSendReviewRequest = async (notification: any) => {
    try {
        const { customerPhone, customerName } = notification.metadata;
        const msg = `Olá ${customerName}! 👋 Ficamos felizes em te atender. Poderia dedicar 30 segundos para nos avaliar no Google? ⭐ https://g.page/r/your-id/review`;
        await api.post('/whatsapp/send', { phone: customerPhone, message: msg });
        alert('Pedido de avaliação enviado!');
        markAsRead(notification.id);
    } catch (e) {
        alert('Erro ao enviar mensagem.');
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'sale': return <ShoppingCart sx={{ color: '#2ecc71' }} />;
      case 'os': return <Build sx={{ color: '#3498db' }} />;
      case 'success': return <CheckCircle sx={{ color: '#2ecc71' }} />;
      default: return <Info sx={{ color: '#95a5a6' }} />;
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 350, maxHeight: 500, borderRadius: '12px', mt: 1.5 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Notificações</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>Limpar todas</Button>
          )}
        </Box>
        <Divider />
        
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">Nenhuma notificação por aqui.</Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <ListItem 
                key={n.id} 
                button 
                onClick={() => handleNotificationClick(n)}
                sx={{ 
                    bgcolor: n.read ? 'transparent' : alpha('#3498db', 0.05),
                    borderBottom: '1px solid #f0f0f0',
                    '&:hover': { bgcolor: alpha('#3498db', 0.1) }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'transparent', border: '1px solid #eee' }}>
                    {getIcon(n.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {n.message}
                      </Typography>
                      {n.metadata?.action === 'google_review_prompt' && !n.read && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Button size="small" variant="contained" color="success" onClick={() => handleSendReviewRequest(n)} sx={{ fontSize: '0.65rem' }}>Sim</Button>
                              <Button size="small" variant="outlined" onClick={() => markAsRead(n.id)} sx={{ fontSize: '0.65rem' }}>Não</Button>
                          </Box>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: ptBR })}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationCenter;
