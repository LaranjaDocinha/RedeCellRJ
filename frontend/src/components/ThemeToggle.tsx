import React from 'react';
import { IconButton, Box, alpha, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../styles/theme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <Tooltip title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Noturno"}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            width: 48,
            height: 48,
            background: isDark 
              ? 'rgba(30, 30, 30, 0.6)' 
              : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
            color: isDark ? '#f1c40f' : '#34495e',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: isDark 
                ? 'rgba(50, 50, 50, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
              transform: 'scale(1.1) rotate(15deg)',
            }
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isDark ? <FiMoon size={20} /> : <FiSun size={20} />}
            </motion.div>
          </AnimatePresence>
        </IconButton>
      </Tooltip>
    </Box>
  );
};