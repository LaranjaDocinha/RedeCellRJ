import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Badge, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Tooltip,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import { 
  FaBell, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaBoxOpen, 
  FaShoppingCart,
  FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { TopbarBtn } from './Topbar.styled';
import moment from 'moment';
import { Button } from './Button';

// --- Tipos de Notificação ---
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'inventory';
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, title: 'Estoque Baixo', message: 'O produto "iPhone 15 Pro" atingiu o nível crítico.', type: 'inventory', time: new Date().toISOString(), read: false },
  { id: 2, title: 'Venda Realizada', message: 'Nova venda registrada no PDV #04.', type: 'success', time: moment().subtract(1, 'hour').toISOString(), read: false },
  { id: 3, title: 'Sistema', message: 'Backup diário concluído com sucesso.', type: 'info', time: moment().subtract(5, 'hours').toISOString(), read: true },
  { id: 4, title: 'Alerta de Segurança', message: 'Tentativa de login bloqueada em IP desconhecido.', type: 'warning', time: moment().subtract(1, 'day').toISOString(), read: false },
];

const NotificationsDropdown: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return { icon: <FaShoppingCart />, color: theme.palette.success.main };
      case 'warning': return { icon: <FaExclamationTriangle />, color: theme.palette.warning.main };
      case 'inventory': return { icon: <FaBoxOpen />, color: theme.palette.error.main };
      default: return { icon: <FaInfoCircle />, color: theme.palette.info.main };
    }
  };

  return (
    <>
      <TopbarBtn onClick={handleClick} aria-label="Ver notificações">
        <Badge 
            badgeContent={unreadCount} 
            color="error" 
            sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16, fontWeight: 400 } }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <FaBell size={18} />
          </motion.div>
        </Badge>
      </TopbarBtn>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 360,
            maxWidth: '90vw',
            borderRadius: '16px',
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
            boxShadow: theme.shadows[10],
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDarkMode ? alpha('#fff', 0.02) : '#f8f9fa' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, fontSize: '0.95rem' }}>Central de Notificações</Typography>
          <Button 
            variant="text" 
            label="Lidas" 
            onClick={markAllAsRead}
            sx={{ fontSize: '0.7rem', fontWeight: 400, minWidth: 'auto', p: 0.5 }}
          />
        </Box>
        <Divider />

        {/* List */}
        <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
              <FaCheckCircle size={32} style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ fontWeight: 400 }}>Tudo em dia por aqui!</Typography>
            </Box>
          ) : (
            notifications.map((n) => {
              const { icon, color } = getIcon(n.type);
              return (
                <ListItem 
                  key={n.id} 
                  sx={{ 
                    px: 2, py: 1.5, 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: n.read ? 'transparent' : alpha(theme.palette.primary.main, 0.03),
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 36, height: 36 }}>
                      {React.cloneElement(icon as React.ReactElement, { size: 16 })}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 500, fontSize: '0.85rem' }}>{n.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>{moment(n.time).fromNow()}</Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, lineHeight: 1.3 }}>
                        {n.message}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })
          )}
        </List>

        {/* Footer */}
        <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: isDarkMode ? alpha('#fff', 0.01) : '#fff' }}>
          <Button 
            fullWidth 
            variant="text" 
            label="Ver todo o histórico" 
            sx={{ fontSize: '0.75rem', fontWeight: 400 }} 
          />
        </Box>
      </Popover>
    </>
  );
};

export default NotificationsDropdown;