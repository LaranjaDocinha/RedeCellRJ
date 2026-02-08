import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardContainer, SLABar, TimerDisplay, FloatingNote, CardActionsOverlay } from './Kanban.styled';
import { IconButton, Tooltip, Avatar, Box, Typography, Stack, alpha, useTheme, Chip, Checkbox, Divider, TextField } from '@mui/material';
import { 
  FaTrash, FaWhatsapp, FaExclamationCircle, FaCheckDouble, 
  FaClock, FaToolbox, FaUserTie, FaCheck, FaHistory, 
  FaPlay, FaPause, FaBatteryThreeQuarters, FaMoneyBillWave, FaShieldAlt,
  FaEdit, FaEye
} from 'react-icons/fa';
import { Card } from '../../types/kanban';
import moment from 'moment';

import { useWhatsappApi } from '../../hooks/useWhatsappApi';
import { useKanbanApi } from '../../hooks/useKanbanApi';
import { useNotification } from '../../contexts/NotificationContext';

interface KanbanCardProps {
  card: Card;
  onDelete: (cardId: number, columnId: number) => void;
  onEdit: (card: Card) => void;
  availableAssignees: any[];
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onActionComplete?: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ 
    card, onDelete, onEdit, availableAssignees, 
    isSelected, onToggleSelect, onActionComplete
}) => {
  const theme = useTheme();
  const { sendTemplate } = useWhatsappApi();
  const { moveCard, updateCard } = useKanbanApi();
  const { addNotification } = useNotification();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(card.title);

  const handleTitleSubmit = async () => {
      if (tempTitle.trim() && tempTitle !== card.title) {
          try {
              await updateCard({ id: card.id, title: tempTitle });
              addNotification("Título atualizado.", "info");
          } catch (e) {
              setTempTitle(card.title);
          }
      }
      setIsEditingTitle(false);
  };

  const handleWhatsapp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = window.prompt("Confirme o telefone do cliente (com DDD):", "21999999999");
    if (phone) {
        await sendTemplate(phone, 'service_order_update', { 
            customerName: 'Cliente', 
            orderId: card.service_order_id || 0,
            status: 'em andamento' 
        });
    }
  };

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  // Repair Timer Logic
  useEffect(() => {
    let interval: any;
    if (card.timer_started_at) {
      interval = setInterval(() => {
        const diff = moment().diff(moment(card.timer_started_at), 'seconds');
        setCurrentTime((card.total_repair_time || 0) + diff);
      }, 1000);
    } else {
      setCurrentTime(card.total_repair_time || 0);
    }
    return () => clearInterval(interval);
  }, [card.timer_started_at, card.total_repair_time]);

  const assignee = availableAssignees.find(a => a.id === card.assignee_id);
  const hoursSinceCreation = moment().diff(moment(card.created_at), 'hours');
  
  // SLA Logic
  const slaPercent = Math.min((hoursSinceCreation / 48) * 100, 100);
  const slaColor = slaPercent > 80 ? theme.palette.error.main : slaPercent > 50 ? theme.palette.warning.main : theme.palette.success.main;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileDrag={{ rotate: 3, scale: 1.05, cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{ 
          width: '100%',
          ...(card.priority === 'high' ? {
              animation: 'breathingGlow 2s infinite',
              '--glow-rgb': '244, 67, 54'
          } : {})
      }}
    >
        <CardContainer 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            $priority={card.priority}
            $isSelected={isSelected}
            $complexity={(card as any).complexity}
            className={isDragging ? 'dragging' : ''}
        >
            {/* Ações Rápidas no Hover */}
            <CardActionsOverlay className="card-actions">
                <Tooltip title="WhatsApp">
                    <IconButton size="small" onClick={handleWhatsapp} sx={{ color: '#25D366' }}><FaWhatsapp size={14}/></IconButton>
                </Tooltip>
                <Tooltip title="Ver Detalhes">
                    <IconButton size="small" onClick={() => onEdit(card)} color="primary"><FaEye size={14}/></IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(card.id, card.column_id); }} color="error"><FaTrash size={12}/></IconButton>
                </Tooltip>
            </CardActionsOverlay>

            <Stack direction="row" spacing={1} alignItems="flex-start">
                <Checkbox 
                    checked={isSelected} 
                    onChange={(e) => { e.stopPropagation(); onToggleSelect(card.id); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    size="small" 
                    sx={{ p: 0, mt: 0.2 }} 
                />
                
                <Box sx={{ flex: 1 }}>
                    {isEditingTitle ? (
                        <TextField 
                            fullWidth size="small" variant="standard" autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleTitleSubmit}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <Typography 
                            variant="subtitle2" 
                            fontWeight={500} 
                            onDoubleClick={() => setIsEditingTitle(true)}
                            sx={{ lineHeight: 1.2, cursor: 'text' }}
                        >
                            {card.title}
                        </Typography>
                    )}
                    
                    {card.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ 
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden', mt: 0.5, lineHeight: 1.3 
                        }}>
                            {card.description}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                <Stack direction="row" spacing={1}>
                    {assignee && (
                        <Tooltip title={`Técnico: ${assignee.name}`}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: theme.palette.primary.main }}>
                                {assignee.name[0]}
                            </Avatar>
                        </Tooltip>
                    )}
                    {(card as any).is_warranty && (
                        <Tooltip title="Garantia">
                            <Chip icon={<FaShieldAlt size={10} />} label="Garantia" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                        </Tooltip>
                    )}
                </Stack>
                <TimerDisplay $isActive={!!card.timer_started_at}>
                    <FaClock size={10} /> {moment.utc(currentTime * 1000).format('HH:mm:ss')}
                </TimerDisplay>
            </Stack>

            {/* Barra de SLA */}
            <Tooltip title={`SLA: ${slaPercent.toFixed(0)}% do tempo consumido`}>
                <SLABar $percent={slaPercent} $color={slaColor} />
            </Tooltip>
        </CardContainer>
    </motion.div>
  );
};

export default KanbanCard;