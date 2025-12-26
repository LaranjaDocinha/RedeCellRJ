import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTrash, FaGripVertical, FaUserEdit } from 'react-icons/fa';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Typography, Box, Avatar, IconButton, Tooltip, Stack, Button as MuiButton } from '@mui/material';
import { CartItemType } from '../../types/cart';

interface POSCartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, newQuantity: number) => void;
  onRemove: (id: number) => void;
  onUpdateSalesperson: (id: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
}

const ItemWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  box-shadow: ${({ theme }) => theme.shadows[1]};
  touch-action: none;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.text.disabled};
  cursor: grab;
  padding: 0 0.25rem;
  &:active { cursor: grabbing; }
`;

const POSCartItem: React.FC<POSCartItemProps> = ({ item, onUpdateQuantity, onRemove, onUpdateSalesperson, onUpdateNotes }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ItemWrapper
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
    >
      <DragHandle {...attributes} {...listeners}>
        <FaGripVertical />
      </DragHandle>

      <Avatar 
        variant="rounded" 
        src={item.image_url || 'https://placehold.co/100x100?text=RC'} 
        sx={{ width: 50, height: 50, bgcolor: 'action.hover' }} 
      />

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ fontSize: '0.9rem' }}>
          {item.product_name || item.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
                {item.color} • R$ {item.price.toFixed(2)}
            </Typography>
            <Tooltip title="Atribuir Vendedor">
                <IconButton size="small" onClick={() => onUpdateSalesperson(item.id)} sx={{ p: 0.2, color: 'primary.main' }}>
                    <FaUserEdit size={12} />
                </IconButton>
            </Tooltip>
        </Stack>
        {item.salesperson_name && (
            <Typography variant="caption" sx={{ display: 'block', color: 'success.main', fontWeight: 800, fontSize: '0.6rem' }}>
                VENDEDOR: {item.salesperson_name.toUpperCase()}
            </Typography>
        )}
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <MuiButton 
            size="small" 
            sx={{ minWidth: 30, p: 0, borderRadius: '8px' }} 
            variant="outlined"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >-</MuiButton>
        <Typography variant="body2" fontWeight={800} sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
        <MuiButton 
            size="small" 
            sx={{ minWidth: 30, p: 0, borderRadius: '8px' }} 
            variant="outlined"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >+</MuiButton>
      </Stack>

      <Box sx={{ textAlign: 'right', minWidth: 90 }}>
        <Typography variant="subtitle2" fontWeight={900} color="primary">
          R$ {item.subtotal.toFixed(2)}
        </Typography>
      </Box>

      <IconButton size="small" color="error" onClick={() => onRemove(item.id)}>
        <FaTrash size={14} />
      </IconButton>
    </ItemWrapper>
  );
};

export default POSCartItem;