import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { FiSearch, FiInbox, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

export type EmptyStateType = 'search' | 'data' | 'error' | 'filter';

interface SmartEmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const SmartEmptyState: React.FC<SmartEmptyStateProps> = ({
  type = 'data',
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  const theme = useTheme();

  const getDefaults = () => {
    switch (type) {
      case 'search':
        return {
          icon: <FiSearch size={64} />,
          title: 'Nenhum resultado encontrado',
          description: 'Tente ajustar sua busca ou filtros para encontrar o que procura.',
          actionLabel: 'Limpar busca'
        };
      case 'error':
        return {
          icon: <FiAlertCircle size={64} />,
          title: 'Ops! Algo deu errado',
          description: 'Não conseguimos carregar os dados. Tente novamente.',
          actionLabel: 'Tentar novamente'
        };
      case 'filter':
          return {
            icon: <FiInbox size={64} />,
            title: 'Sem itens com este filtro',
            description: 'Tente remover alguns filtros para ver mais resultados.',
            actionLabel: 'Limpar Filtros'
          };
      case 'data':
      default:
        return {
          icon: <FiInbox size={64} />,
          title: 'Está meio vazio por aqui',
          description: 'Comece adicionando novos itens agora mesmo.',
          actionLabel: 'Criar Novo'
        };
    }
  };

  const defaults = getDefaults();
  const displayIcon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDesc = description || defaults.description;
  const displayActionLabel = actionLabel || defaults.actionLabel;

  return (
    <Paper 
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        elevation={0} 
        sx={{ 
            p: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: 'transparent',
            height: '100%',
            minHeight: 300
        }}
    >
      <Box 
        component={motion.div}
        animate={{ 
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
        }}
        transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
        sx={{ 
            mb: 3, 
            color: theme.palette.text.secondary,
            opacity: 0.5,
            p: 3,
            borderRadius: '50%',
            bgcolor: theme.palette.action.hover
        }}
      >
        {displayIcon}
      </Box>
      
      <Typography variant="h5" fontWeight={600} gutterBottom color="text.primary">
        {displayTitle}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 4 }}>
        {displayDesc}
      </Typography>

      {onAction && (
        <Button 
            variant="contained" 
            size="large" 
            onClick={onAction}
            startIcon={<FiPlus />}
            sx={{ borderRadius: 3, px: 4 }}
        >
          {displayActionLabel}
        </Button>
      )}
    </Paper>
  );
};
