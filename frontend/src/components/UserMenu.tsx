import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Avatar, 
  Divider, 
  useTheme, 
  alpha 
} from '@mui/material';
import { FaUserCircle, FaCog, FaSignOutAlt, FaChevronDown, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          padding: '4px 12px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }
        }}
      >
        <Avatar 
            sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontSize: '1rem'
            }}
        >
          {user?.name ? user.name[0].toUpperCase() : <FaUser size={14} />}
        </Avatar>
        
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography 
            variant="body2" 
            sx={{ 
                fontWeight: 400, 
                color: theme.palette.text.primary,
                lineHeight: 1
            }}
          >
            {user?.name || 'Usuário'}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5
            }}
          >
            {user?.role || 'Membro'}
          </Typography>
        </Box>
        
        <FaChevronDown 
            size={10} 
            style={{ 
                opacity: 0.5, 
                transition: 'transform 0.2s',
                transform: open ? 'rotate(180deg)' : 'none',
                color: theme.palette.text.primary
            }} 
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: isDarkMode ? 'none' : 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: '12px',
            minWidth: 200,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            backgroundImage: 'none',
            '& .MuiMenuItem-root': {
                fontSize: '0.85rem',
                py: 1.5,
                fontWeight: 400,
                transition: 'all 0.2s',
                '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                }
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 400 }}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <FaUserCircle size={18} />
          </ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <FaCog size={18} />
          </ListItemIcon>
          Configurações
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <FaSignOutAlt size={18} color={theme.palette.error.main} />
          </ListItemIcon>
          Sair do Sistema
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;