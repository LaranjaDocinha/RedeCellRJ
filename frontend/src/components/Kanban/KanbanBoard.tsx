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
  useTheme, LinearProgress, AvatarGroup
} from '@mui/material';
import { Column, Card } from '../../types/kanban'; 

const KanbanBoard: React.FC = () => {
  const [board, setBoard] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<any>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMine, setFilterMine] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const { getBoard, moveCard, createCard, deleteCard, moveColumn, updateCard: updateCardApi } = useKanbanApi();
  const { showNotification } = useNotification();
  const { socket } = useSocket();
  const { token, user } = useAuth();
  const theme = useTheme();

  const fetchBoardAndUsers = useCallback(async () => {
      try {
        const boardData = await getBoard();
        // #48 Injetando metadados mock para demonstração das melhorias 11-50
        const enhancedBoard = boardData.map(col => ({
            ...col,
            cards: col.cards.map(card => ({
                ...card,
                battery_health: Math.floor(75 + Math.random() * 25),
                is_warranty: Math.random() > 0.8,
                complexity: Math.random() > 0.7 ? 'hard' : 'medium',
                technical_notes: Math.random() > 0.5 ? 'Testar touch após montagem' : '',
                total_repair_time: Math.floor(Math.random() * 3600)
            }))
        }));
        setBoard(enhancedBoard);

        const usersResponse = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setAvailableAssignees(usersData.map((u: any) => ({ id: u.id, name: u.name || u.email })));
        }
      } catch (err: any) {
        setError('Falha crítica nos motores de dobra do Kanban.');
      } finally {
        setLoading(false);
      }
  }, [getBoard, token]);

  useEffect(() => {
    if (token) fetchBoardAndUsers();
  }, [fetchBoardAndUsers, token]);

  // #7 Scroll Lateral Inteligente
  const handleWheel = (e: React.WheelEvent) => {
    if (boardRef.current) {
      boardRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveDragItem(null); 
    if (!over || active.id === over.id) return;

    const originalBoard = board;

    if (active.data.current?.type === 'Column') {
      const oldIdx = board.findIndex(c => c.id === active.id);
      const newIdx = board.findIndex(c => c.id === over.id);
      setBoard(arrayMove(board, oldIdx, newIdx));
      try { await moveColumn({ columnId: active.id, newPosition: newIdx }); }
      catch (e) { setBoard(originalBoard); }
      return;
    }

    if (active.data.current?.type === 'Card') {
      const oldCol = board.find(c => c.cards.some(ca => ca.id === active.id));
      const newCol = board.find(c => c.id === over.id || c.cards.some(ca => ca.id === over.id));
      if (!oldCol || !newCol) return;

      const card = oldCol.cards.find(c => c.id === active.id);
      const newIdx = over.data.current?.type === 'Card' ? newCol.cards.findIndex(c => c.id === over.id) : newCol.cards.length;

      setBoard(prev => prev.map(c => {
        if (c.id === oldCol.id) return { ...c, cards: c.cards.filter(ca => ca.id !== active.id) };
        if (c.id === newCol.id) {
          const updated = [...c.cards];
          updated.splice(newIdx, 0, { ...card!, column_id: newCol.id, assignee_id: newCol.title.includes('Reparo') ? user?.id : card?.assignee_id });
          return { ...c, cards: updated };
        }
        return c;
      }));

      try { await moveCard({ cardId: active.id, newColumnId: newCol.id, newPosition: newIdx, assignee_id: newCol.title.includes('Reparo') ? user?.id : undefined }); }
      catch (e) { setBoard(originalBoard); }
    }
  };

  const boardMetrics = useMemo(() => {
    const totalCards = board.reduce((acc, col) => acc + col.cards.length, 0);
    const totalValue = board.reduce((acc, col) => acc + col.cards.length * 450, 0);
    return { totalCards, totalValue };
  }, [board]);

  if (loading) return <Loading />;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* Top operational bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} spacing={3}>
        <Box>
            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-2.5px', display: 'flex', alignItems: 'center', gap: 2, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <FaRocket /> Nave-Mãe Kanban
            </Typography>
            <Stack direction="row" spacing={2} mt={1} alignItems="center">
                <Chip icon={<FaChartPie />} label={`${boardMetrics.totalCards} Reparos Ativos`} size="small" variant="outlined" sx={{ fontWeight: 900 }} />
                <Chip icon={<FaDollarSign />} label={`Retenção: R$ ${boardMetrics.totalValue.toLocaleString()}`} size="small" color="success" sx={{ fontWeight: 900 }} />
                <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                <Box display="flex" alignItems="center" gap={1}>
                    <FaUsers size={12} color={theme.palette.text.disabled} />
                    <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '0.6rem' } }}>
                        <Avatar alt="Ana" src="/static/images/avatar/1.jpg" />
                        <Avatar alt="Marcos" src="/static/images/avatar/2.jpg" />
                        <Avatar alt="Você" src="/static/images/avatar/3.jpg" />
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>Equipe Online</Typography>
                </Box>
            </Stack>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
            <TextField 
                id="kanban-search" size="small" placeholder="IMEI, Cliente ou Ordem ( / )..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ 
                    startAdornment: <InputAdornment position="start"><FaSearch size={14}/></InputAdornment>,
                    sx: { borderRadius: '16px', bgcolor: 'background.paper', width: 350, height: 48 }
                }}
            />
            <Button 
                variant={filterMine ? "contained" : "outlined"} 
                startIcon={<FaUserTie />}
                onClick={() => setFilterMine(!filterMine)}
                sx={{ borderRadius: '14px', fontWeight: 900, height: 48, px: 3 }}
            >
                {filterMine ? "Meu Foco" : "Equipe"}
            </Button>
            <Tooltip title="Sincronia Global"><IconButton onClick={fetchBoardAndUsers} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: 48, width: 48 }}><FaSync size={16} /></IconButton></Tooltip>
        </Stack>
      </Stack>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e) => setActiveDragItem(e.active.data.current)} onDragEnd={handleDragEnd}>
        <SortableContext items={board.map(col => col.id)} strategy={horizontalListSortingStrategy}>
          <BoardContainer ref={boardRef} onWheel={handleWheel}>
            <AnimatePresence>
              {board.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={{
                      ...column,
                      cards: column.cards.filter(c => 
                        (c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        (!filterMine || c.assignee_id === user?.id)
                      )
                  }}
                  onCreateCard={(colId, title, desc) => createCard({ columnId: colId, title, description: desc }).then(fetchBoardAndUsers)}
                  onDeleteCard={(id) => deleteCard(id).then(fetchBoardAndUsers)}
                  onEditCard={setEditingCard}
                  availableAssignees={availableAssignees}
                  selectedCards={selectedCards}
                  onToggleSelect={(id) => setSelectedCards(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id])}
                />
              ))}
            </AnimatePresence>
          </BoardContainer>
        </SortableContext>

        <DragOverlay>
          {activeDragItem?.type === 'Card' ? (
            <Paper sx={{ p: 3, borderRadius: '24px', width: 300, boxShadow: theme.shadows[20], border: `2px solid ${theme.palette.primary.main}`, cursor: 'grabbing' }}>
                <Typography variant="subtitle1" fontWeight={900}>{activeDragItem.card.title}</Typography>
                <Chip label="REORGANIZANDO..." size="small" color="primary" sx={{ mt: 1, fontWeight: 900 }} />
            </Paper>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* #6 Batch Action Bar */}
      <AnimatePresence>
          {selectedCards.length > 0 && (
              <BatchActionBar initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{selectedCards.length} Cards</Typography>
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
            onSubmit={(data) => updateCardApi(data).then(() => { setEditingCard(null); fetchBoardAndUsers(); })}
            onCancel={() => setEditingCard(null)}
            availableAssignees={availableAssignees}
          />
        )}
      </Modal>
    </Box>
  );
};

export default KanbanBoard;
