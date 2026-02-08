import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { FaBell } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { TopbarBtn } from './Topbar.styled';
import { useNotification } from '../contexts/NotificationContext';

interface NotificationsDropdownProps {
  onOpen?: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onOpen }) => {
  const theme = useTheme();
  const { notifications } = useNotification();
  const [shouldShake, setShouldShake] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (unreadCount > 0) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const bellVariants = {
    shake: {
      rotate: [0, -15, 15, -15, 15, 0],
      transition: { duration: 0.5 }
    },
    idle: { rotate: 0 }
  };

  return (
    <Tooltip title="Notificações (Alt + N)" arrow>
      <TopbarBtn onClick={onOpen} aria-label="Ver notificações">
        <Badge 
            badgeContent={unreadCount} 
            color="error" 
            sx={{ 
              '& .MuiBadge-badge': { 
                fontSize: '0.65rem', 
                height: 16, 
                minWidth: 16, 
                fontWeight: 400,
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
              },
              '@keyframes pulse': {
                '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}` },
                '70%': { boxShadow: `0 0 0 6px ${alpha(theme.palette.error.main, 0)}` },
                '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
              }
            }}
        >
          <motion.div 
            variants={bellVariants}
            animate={shouldShake ? 'shake' : 'idle'}
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
          >
            <FaBell size={18} />
          </motion.div>
        </Badge>
      </TopbarBtn>
    </Tooltip>
  );
};

export default NotificationsDropdown;