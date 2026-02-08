import React, { useMemo, useState } from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  IconButton, 
  Button,
  useTheme,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Chip,
  Stack,
  Tooltip,
  InputBase,
  Switch,
  FormControlLabel,
  alpha,
  Badge
} from '@mui/material';
import { 
  FiX, FiCheck, FiBell, FiInfo, FiAlertTriangle, FiCheckCircle, FiAlertOctagon, 
  FiSearch, FiCpu, FiClock, FiTrash
} from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [search, setSearch] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (onlyUnread && n.read) return false;
      if (filter !== 'all' && n.severity !== filter) return false;
      if (search && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [notifications, filter, search, onlyUnread]);

  const aiSummary = useMemo(() => {
    if (notifications.length === 0) return null;
    const errors = notifications.filter(n => n.severity === 'error' && !n.read).length;
    if (errors > 0) return `Atenção necessária: ${errors} problemas críticos não lidos.`;
    if (unreadCount > 5) return `Dia movimentado! ${unreadCount} novas notificações.`;
    return null;
  }, [notifications, unreadCount]);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <FiCheckCircle />;
      case 'warning': return <FiAlertTriangle />;
      case 'error': return <FiAlertOctagon />;
      default: return <FiInfo />;
    }
  };

  const getColor = (severity: string) => {
      switch (severity) {
        case 'success': return theme.palette.success.main;
        case 'warning': return theme.palette.warning.main;
        case 'error': return theme.palette.error.main;
        default: return theme.palette.info.main;
      }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 }, p: 0, bgcolor: theme.palette.background.default }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: theme.palette.background.paper }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
                <Badge badgeContent={unreadCount} color="error">
                    <FiBell size={24} />
                </Badge>
                <Typography variant="h6" fontWeight={600}>Notificações</Typography>
            </Box>
            <Box>
                {unreadCount > 0 && (
                    <Tooltip title="Marcar tudo como lido">
                        <IconButton onClick={markAllAsRead} size="small" color="primary">
                            <FiCheck />
                        </IconButton>
                    </Tooltip>
                )}
                <IconButton onClick={onClose} size="small">
                    <FiX />
                </IconButton>
            </Box>
        </Box>

        {aiSummary && (
            <Box sx={{ 
                p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), 
                color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2
            }}>
                <FiCpu size={18} />
                <Typography variant="body2" fontWeight={500}>{aiSummary}</Typography>
            </Box>
        )}

        <Box display="flex" alignItems="center" gap={1} mb={2}>
            <InputBase 
                placeholder="Buscar..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startAdornment={<FiSearch style={{ marginRight: 8, opacity: 0.5 }} />}
                sx={{ 
                    bgcolor: theme.palette.action.hover, 
                    px: 2, py: 0.5, borderRadius: 2, flex: 1, fontSize: 14 
                }}
            />
            <FormControlLabel 
                control={<Switch size="small" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />}
                label={<Typography variant="caption">Não lidas</Typography>}
                sx={{ mr: 0 }}
            />
        </Box>

        <Stack direction="row" spacing={1}>
            {['all', 'error', 'warning', 'info'].map((f) => (
                <Chip 
                    key={f} 
                    label={f === 'all' ? 'Todas' : f === 'error' ? 'Erros' : f === 'warning' ? 'Alertas' : 'Info'} 
                    size="small" 
                    onClick={() => setFilter(f as any)}
                    color={filter === f ? (f === 'all' ? 'default' : f as any) : 'default'}
                    variant={filter === f ? 'filled' : 'outlined'}
                    clickable
                />
            ))}
        </Stack>
      </Box>

      {/* List */}
      <List sx={{ p: 0, overflowY: 'auto', flex: 1, bgcolor: theme.palette.background.default }}>
        <AnimatePresence initial={false}>
            {filteredNotifications.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center', opacity: 0.5, mt: 4 }}>
                    <FiBell size={48} style={{ marginBottom: 16 }} />
                    <Typography>Nenhuma notificação encontrada.</Typography>
                </Box>
            ) : (
                filteredNotifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginLeft: -100 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ListItem 
                            alignItems="flex-start"
                            sx={{ 
                                bgcolor: notification.read ? 'transparent' : alpha(getColor(notification.severity || 'info'), 0.05),
                                borderLeft: `4px solid ${notification.read ? 'transparent' : getColor(notification.severity || 'info')}`,
                                '&:hover': { bgcolor: theme.palette.action.hover },
                                py: 2
                            }}
                            secondaryAction={
                                <Stack direction="column" spacing={1}>
                                    {!notification.read && (
                                        <IconButton size="small" onClick={() => markAsRead(notification.id)}>
                                            <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                                        </IconButton>
                                    )}
                                    <IconButton size="small" edge="end" sx={{ opacity: 0.3 }}>
                                        <FiTrash size={14} />
                                    </IconButton>
                                </Stack>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ 
                                    bgcolor: alpha(getColor(notification.severity || 'info'), 0.1), 
                                    color: getColor(notification.severity || 'info') 
                                }}>
                                    {getIcon(notification.severity || 'info')}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" pr={4}>
                                        <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                                            {notification.message}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                        <FiClock size={10} style={{ opacity: 0.7 }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}
                                        </Typography>
                                        {notification.type && (
                                            <Chip label={notification.type} size="small" sx={{ height: 16, fontSize: 10 }} />
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', ml: 9 }} />
                    </motion.div>
                ))
            )}
        </AnimatePresence>
      </List>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Button size="small" color="inherit">Configurar Notificações</Button>
      </Box>
    </Drawer>
  );
};