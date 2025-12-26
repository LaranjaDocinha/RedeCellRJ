import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnContainer, ColumnHeader, CardsContainer, InlineAddInput, ColumnFooterValue } from './Kanban.styled';
import KanbanCard from './KanbanCard';
import { FaEllipsisV, FaLayerGroup, FaCoins } from 'react-icons/fa';
import { Column, Card } from '../../types/kanban'; 
import { Typography, Box, Stack, Chip, alpha, useTheme, IconButton } from '@mui/material';

interface KanbanColumnProps {
  column: Column;
  onCreateCard: (columnId: number, title: string, description: string) => void;
  onDeleteCard: (cardId: number, columnId: number) => void;
  onEditCard: (card: Card) => void;
  availableAssignees: any[];
  selectedCards: number[];
  onToggleSelect: (id: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
    column, onCreateCard, onDeleteCard, onEditCard, 
    availableAssignees, selectedCards, onToggleSelect 
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const theme = useTheme();
  
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const isOverLimit = column.wip_limit !== -1 && column.cards.length >= column.wip_limit;

  const totalValue = useMemo(() => {
      // Mock de valor por card para visão de retenção (#21)
      return column.cards.length * 450;
  }, [column.cards]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickTitle.trim()) {
      onCreateCard(column.id, quickTitle, '');
      setQuickTitle('');
    }
  };

  return (
    <ColumnContainer 
      ref={setNodeRef}
      $isOverLimit={isOverLimit}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <ColumnHeader>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, letterSpacing: 1, color: isOverLimit ? 'error.main' : 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaLayerGroup size={12} /> {column.title.toUpperCase()}
            </Typography>
            <IconButton size="small"><FaEllipsisV size={12} /></IconButton>
        </Stack>
        
        <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
                label={`${column.cards.length} tarefas`} 
                size="small" 
                sx={{ fontWeight: 900, height: 20, fontSize: '0.6rem', bgcolor: alpha(theme.palette.text.primary, 0.05) }} 
            />
            {column.wip_limit !== -1 && (
                <Chip 
                    label={`WIP: ${column.wip_limit}`} 
                    size="small" 
                    variant="outlined"
                    color={isOverLimit ? "error" : "default"}
                    sx={{ fontWeight: 900, height: 20, fontSize: '0.6rem' }} 
                />
            )}
        </Stack>
      </ColumnHeader>

      <CardsContainer>
        <SortableContext items={column.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {column.cards.map(card => (
              <KanbanCard 
                key={card.id} 
                card={card} 
                onDelete={onDeleteCard} 
                onEdit={onEditCard} 
                availableAssignees={availableAssignees}
                isSelected={selectedCards.includes(card.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </CardsContainer>

      {/* #21 Valor de Retenção por Coluna */}
      <ColumnFooterValue>
          <Typography variant="caption" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FaCoins size={10} /> RETENÇÃO:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'success.main' }}>
              R$ {totalValue.toLocaleString()}
          </Typography>
      </ColumnFooterValue>

      {/* #1 Adição Inline Rápida */}
      <Box sx={{ mt: 2, pt: 2 }}>
        <InlineAddInput 
            placeholder="+ Adicionar (Enter)..." 
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={handleKeyPress}
        />
      </Box>
    </ColumnContainer>
  );
};

export default KanbanColumn;
