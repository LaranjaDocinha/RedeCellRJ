import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardContainer, SLABar, TimerDisplay, FloatingNote } from './Kanban.styled';
import { IconButton, Tooltip, Avatar, Box, Typography, Stack, alpha, useTheme, Chip, Checkbox, Divider } from '@mui/material';
import { 
  FaTrash, FaWhatsapp, FaExclamationCircle, FaCheckDouble, 
  FaClock, FaToolbox, FaUserTie, FaCheck, FaHistory, 
  FaPlay, FaPause, FaBatteryThreeQuarters, FaMoneyBillWave, FaShieldAlt
} from 'react-icons/fa';
import { Card } from '../../types/kanban';
import moment from 'moment';

interface KanbanCardProps {
  card: Card;
  onDelete: (cardId: number, columnId: number) => void;
  onEdit: (card: Card) => void;
  availableAssignees: any[];
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ 
    card, onDelete, onEdit, availableAssignees, 
    isSelected, onToggleSelect 
}) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(0);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  // #16 Repair Timer Logic
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

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;
  };

  const assignee = availableAssignees.find(a => a.id === card.assignee_id);
  const hoursSinceCreation = moment().diff(moment(card.created_at), 'hours');
  
  // #17 SLA Logic
  const slaPercent = Math.min((hoursSinceCreation / 48) * 100, 100);
  const slaColor = slaPercent > 80 ? theme.palette.error.main : slaPercent > 50 ? theme.palette.warning.main : theme.palette.success.main;

  return (
    <CardContainer 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      $priority={card.priority}
      $isAging={hoursSinceCreation > 72}
      $color={slaColor}
      $isSelected={isSelected}
      $complexity={card.complexity}
      onClick={() => onEdit(card)}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Stack direction="row" spacing={0.5} alignItems="center">
            <Checkbox 
                size="small" checked={isSelected} 
                onChange={(e) => { e.stopPropagation(); onToggleSelect(card.id); }}
                sx={{ p: 0.5, color: alpha(theme.palette.text.primary, 0.1) }}
            />
            {card.service_order_id && (
                <Chip label={`OS-${card.service_order_id}`} size="small" sx={{ height: 18, fontSize: '0.55rem', fontWeight: 900, bgcolor: 'secondary.main', color: '#fff' }} />
            )}
            {card.is_warranty && <Tooltip title="Garantia"><FaShieldAlt size={12} color={theme.palette.secondary.main} /></Tooltip>}
        </Stack>
        <Stack direction="row" spacing={0.5}>
            <Tooltip title="Finish Express"><IconButton size="small" sx={{ color: 'success.main', p: 0.5 }}><FaCheck size={10} /></IconButton></Tooltip>
            <Tooltip title="WhatsApp"><IconButton size="small" sx={{ color: '#25D366', p: 0.5 }}><FaWhatsapp size={14} /></IconButton></Tooltip>
        </Stack>
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 1 }}>{card.title}</Typography>
      
      {/* #11 Battery & Cost Info */}
      <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
          {card.battery_health && (
              <Box display="flex" alignItems="center" gap={0.5} sx={{ color: card.battery_health < 80 ? 'error.main' : 'success.main' }}>
                  <FaBatteryThreeQuarters size={10} />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900 }}>{card.battery_health}%</Typography>
              </Box>
          )}
          <Box display="flex" alignItems="center" gap={0.5} sx={{ opacity: 0.7 }}>
              <FaMoneyBillWave size={10} color={theme.palette.success.main} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900 }}>R$ 450,00</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ opacity: 0.7 }}>
              <FaCheckDouble size={10} color={theme.palette.primary.main} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900 }}>2/4</Typography>
          </Box>
      </Stack>

      {/* #20 Nota Técnica Flutuante */}
      {card.technical_notes && <FloatingNote>{card.technical_notes}</FloatingNote>}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
            {assignee ? (
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: theme.palette.primary.main, fontWeight: 900, border: `2px solid ${theme.palette.background.paper}` }}>{assignee.name[0]}</Avatar>
            ) : <FaUserTie size={12} style={{ opacity: 0.2 }} />}
            <TimerDisplay $isActive={!!card.timer_started_at}>
                <FaClock size={10} /> {formatTime(currentTime)}
            </TimerDisplay>
        </Stack>
        <Stack direction="row" spacing={1}>
            {card.priority === 'critical' && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><FaExclamationCircle color={theme.palette.error.main} size={14} /></motion.div>}
            <IconButton size="small" sx={{ p: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                {card.timer_started_at ? <FaPause size={8} /> : <FaPlay size={8} />}
            </IconButton>
        </Stack>
      </Box>

      {/* #17 Barra de SLA */}
      <Tooltip title={`SLA: ${slaPercent.toFixed(0)}% do tempo consumido`}>
        <SLABar $percent={slaPercent} $color={slaColor} />
      </Tooltip>
    </CardContainer>
  );
};

export default KanbanCard;
