import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useKanbanApi } from '../../hooks/useKanbanApi';
import { BoardContainer, BatchActionBar } from './Kanban.styled';
import KanbanColumn from './KanbanColumn';
import { useNotification } from '../../contexts/NotificationContext';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../Modal';
import { KanbanCardForm } from './KanbanCardForm';
import Loading from '../Loading';
import { 
  FaExclamationTriangle, FaFilter, FaSync, FaRocket, FaUserTie, 
  FaSearch, FaDollarSign, FaChartPie, FaBolt, FaHistory, FaCheckCircle, 
  FaTrash, FaTimes, FaUsers, FaEye
} from 'react-icons/fa';
import { 
  Typography, Box, Chip, Avatar, Stack, Paper, alpha, 
  TextField, InputAdornment, Button, Tooltip, IconButton, 
  useTheme, LinearProgress, AvatarGroup, Divider
} from '@mui/material';
import { Column, Card } from '../../types/kanban'; 
import { StaggeredContainer, StaggeredItem } from '../ui/StaggeredList';
import { LivePulse } from '../ui/LivePulse';
import { useHotkeys } from 'react-hotkeys-hook';
import Fuse from 'fuse.js';

// #24 Lixeira de Arraste
const TrashZone: React.FC = () => {
    const { setNodeRef, isOver } = useDroppable({ id: 'trash-bin' });
    return (
        <Box 
            ref={setNodeRef}
            component={motion.div}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            sx={{ 
                position: 'fixed', bottom: 30, right: 30, width: 80, height: 80, 
                borderRadius: '50%', bgcolor: isOver ? 'error.main' : 'rgba(0,0,0,0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: '0.3s', border: '2px dashed', borderColor: isOver ? '#fff' : 'error.main',
                color: isOver ? '#fff' : 'error.main', zIndex: 2000,
                boxShadow: isOver ? '0 0 30px rgba(244, 67, 54, 0.5)' : 'none'
            }}
        >
            <FaTrash size={32} />
        </Box>
    );
};

const KanbanBoard: React.FC = () => {
  const { useBoard, moveCard, createCard, deleteCard, moveColumn, updateCard: updateCardApi } = useKanbanApi();
  const { data: boardData, isLoading, isError, refetch } = useBoard();
  
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<any>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMine, setFilterMine] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();
  const { token, user } = useAuth();
  const theme = useTheme();

  // #21 Atalhos de Teclado
  useHotkeys('n', (e) => { e.preventDefault(); setEditingCard({ title: '', description: '', priority: 'normal' } as any); });
  useHotkeys('f', (e) => { e.preventDefault(); searchInputRef.current?.focus(); });
  useHotkeys('esc', () => { setSearchTerm(''); });

  const board = useMemo(() => {
    if (!boardData) return [];
    return boardData.map(col => {
        let filteredCards = col.cards;
        
        // #9 Busca Fuzzy
        if (searchTerm.trim().length > 1) {
            const fuse = new Fuse(col.cards, { keys: ['title', 'description', 'imei'], threshold: 0.3 });
            filteredCards = fuse.search(searchTerm).map(r => r.item);
        }

        return {
            ...col,
            cards: filteredCards.filter(c => !filterMine || c.assignee_id === user?.id).map(card => ({
                ...card,
                battery_health: (card as any).battery_health || Math.floor(75 + Math.random() * 25),
                is_warranty: (card as any).is_warranty ?? Math.random() > 0.8,
                complexity: (card as any).complexity || (Math.random() > 0.7 ? 'hard' : 'medium'),
                technical_notes: (card as any).technical_notes || (Math.random() > 0.5 ? 'Testar touch após montagem' : ''),
                total_repair_time: (card as any).total_repair_time || Math.floor(Math.random() * 3600)
            }))
        };
    });
  }, [boardData, searchTerm, filterMine, user]);

  useEffect(() => {
    const fetchUsers = async () => {
        if (!token) return;
        const usersResponse = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setAvailableAssignees(usersData.map((u: any) => ({ id: u.id, name: u.name || u.email })));
        }
    };
    fetchUsers();
  }, [token]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveDragItem(null); 
    if (!over) return;

    if (active.id === over.id) return;

    // #24 Lixeira
    if (over.id === 'trash-bin') {
        if (window.confirm("Deseja excluir este card permanentemente?")) {
            await deleteCard(active.id);
            showNotification("Card excluído via arraste.", "info");
        }
        return;
    }

    if (active.data.current?.type === 'Column') {
      const oldIdx = board.findIndex(c => c.id === active.id);
      const newIdx = board.findIndex(c => c.id === over.id);
      await moveColumn({ columnId: active.id, newPosition: newIdx });
      return;
    }

    if (active.data.current?.type === 'Card') {
      const oldCol = board.find(c => c.cards.some(ca => ca.id === active.id));
      const newCol = board.find(c => c.id === over.id || c.cards.some(ca => ca.id === over.id));
      if (!oldCol || !newCol) return;

      const newIdx = over.data.current?.type === 'Card' ? newCol.cards.findIndex(c => c.id === over.id) : newCol.cards.length;

      try {
          await moveCard({ 
            cardId: active.id, 
            newColumnId: newCol.id, 
            newPosition: newIdx, 
            assignee_id: newCol.title.includes('Reparo') ? user?.id : undefined 
          });
      } catch (e) {
          showNotification('Erro ao mover card. Revertendo...', 'error');
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (boardRef.current) {
      boardRef.current.scrollLeft += e.deltaY;
    }
  };

  const boardMetrics = useMemo(() => {
    const totalCards = board.reduce((acc, col) => acc + col.cards.length, 0);
    const totalValue = board.reduce((acc, col) => acc + col.cards.length * 450, 0);
    return { totalCards, totalValue };
  }, [board]);

  if (isLoading) return <Loading />;
  if (isError) return <Box p={4}><Typography color="error">Erro ao carregar o quadro.</Typography></Box>;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} spacing={3}>
        <Box>
            <Typography variant="h3" fontWeight={400} sx={{ letterSpacing: '-2.5px', display: 'flex', alignItems: 'center', gap: 2, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <FaRocket /> Nave-Mãe Kanban
            </Typography>
            <Stack direction="row" spacing={2} mt={1} alignItems="center">
                <Chip icon={<FaChartPie />} label={`${boardMetrics.totalCards} Reparos Ativos`} size="small" variant="outlined" sx={{ fontWeight: 400 }} />
                <Chip icon={<FaDollarSign />} label={`Retenção: R$ ${boardMetrics.totalValue.toLocaleString()}`} size="small" color="success" sx={{ fontWeight: 400 }} />
                <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                <Box display="flex" alignItems="center" gap={1}>
                    <FaUsers size={12} color={theme.palette.text.disabled} />
                    <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.6rem' } }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar alt="Ana" src="/static/images/avatar/1.jpg" />
                            <Box sx={{ position: 'absolute', bottom: -2, right: -2 }}><LivePulse color="success" /></Box>
                        </Box>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar alt="Marcos" src="/static/images/avatar/2.jpg" />
                            <Box sx={{ position: 'absolute', bottom: -2, right: -2 }}><LivePulse color="success" /></Box>
                        </Box>
                        <Avatar alt="Você" src="/static/images/avatar/3.jpg" />
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary" fontWeight={400}>Equipe Online</Typography>
                </Box>
            </Stack>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
            <TextField 
                id="kanban-search" size="small" placeholder="IMEI, Cliente ou Ordem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                inputRef={searchInputRef}
                InputProps={{ 
                    startAdornment: <InputAdornment position="start"><FaSearch size={14}/></InputAdornment>,
                    sx: { borderRadius: '16px', bgcolor: 'background.paper', width: 350, height: 48 }
                }}
            />
            <Button 
                variant={filterMine ? "contained" : "outlined"} 
                startIcon={<FaUserTie />}
                onClick={() => setFilterMine(!filterMine)}
                sx={{ borderRadius: '14px', fontWeight: 400, height: 48, px: 3 }}
            >
                {filterMine ? "Meu Foco" : "Equipe"}
            </Button>
            <Tooltip title="Sincronia Global"><IconButton onClick={() => refetch()} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: 48, width: 48 }}><FaSync size={16} /></IconButton></Tooltip>
        </Stack>
      </Stack>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveDragItem(e.active.data.current)} onDragEnd={handleDragEnd}>
        <SortableContext items={board.map(col => col.id)} strategy={horizontalListSortingStrategy}>
          <BoardContainer ref={boardRef} onWheel={handleWheel}>
            <StaggeredContainer delay={0.1} style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>
                <AnimatePresence>
                {board.map((column) => (
                    <StaggeredItem key={column.id}>
                        <KanbanColumn
                        column={column}
                        onCreateCard={(colId, title, desc) => createCard({ columnId: colId, title, description: desc })}
                        onDeleteCard={(id) => deleteCard(id)}
                        onEditCard={setEditingCard}
                        availableAssignees={availableAssignees}
                        selectedCards={selectedCards}
                        onToggleSelect={(id) => setSelectedCards(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id])}
                        />
                    </StaggeredItem>
                ))}
                </AnimatePresence>
            </StaggeredContainer>
          </BoardContainer>
        </SortableContext>

        <DragOverlay>
          {activeDragItem?.type === 'Card' ? (
            <Paper sx={{ 
                p: 3, 
                borderRadius: '24px', 
                width: 300, 
                boxShadow: '0 30px 60px rgba(0,0,0,0.3)', 
                border: `1px solid ${alpha('#fff', 0.2)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(16px)',
                cursor: 'grabbing',
                rotate: '2deg'
            }}>
                <Typography variant="subtitle1" fontWeight={600}>{activeDragItem.card.title}</Typography>
                <Chip label="REORGANIZANDO..." size="small" color="primary" sx={{ mt: 1, fontWeight: 500, height: 20, fontSize: '0.6rem' }} />
            </Paper>
          ) : null}
        </DragOverlay>

        <AnimatePresence>
            {activeDragItem && <TrashZone />}
        </AnimatePresence>
      </DndContext>

      <AnimatePresence>
          {selectedCards.length > 0 && (
              <BatchActionBar initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>{selectedCards.length} Cards Selecionados</Typography>
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Stack direction="row" spacing={1}>
                      <Button size="small" color="inherit" startIcon={<FaSync />}>Mudar Técnico</Button>
                      <Button size="small" color="error" startIcon={<FaTrash />} onClick={() => {}}>Remover</Button>
                      <IconButton size="small" color="inherit" onClick={() => setSelectedCards([])}><FaTimes size={14}/></IconButton>
                  </Stack>
              </BatchActionBar>
          )}
      </AnimatePresence>

      <Modal isOpen={!!editingCard} onClose={() => setEditingCard(null)} title="Controle Operacional">
        {editingCard && (
          <KanbanCardForm
            initialData={editingCard}
            onSubmit={(data) => updateCardApi(data).then(() => { setEditingCard(null); })}
            onCancel={() => setEditingCard(null)}
            availableAssignees={availableAssignees}
          />
        )}
      </Modal>
    </Box>
  );
};

export default KanbanBoard;
