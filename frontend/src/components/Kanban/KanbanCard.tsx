import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CardContainer,
  CardActions,
  ActionButton,
  AssigneeContainer,
  DueDateContainer,
} from './Kanban.styled';
import { FaEdit, FaTrash, FaUser, FaCalendarAlt, FaBars, FaExternalLinkAlt } from 'react-icons/fa'; // Import FaBars
import { motion } from 'framer-motion'; // Import motion
import styled from 'styled-components'; // Import styled
import { Link } from 'react-router-dom';

// Styled component for the drag handle
const DragHandle = styled.div`
  cursor: grab;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xxs} 0;
  margin-bottom: ${({ theme }) => theme.spacing.xxs};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

interface KanbanCardProps {
  card: any;
  onDeleteCard: (cardId: string, columnId: string) => void;
  onEditCard: (card: any) => void; // Add onEditCard
  columnId: string;
  triggerHapticFeedback: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  onDeleteCard,
  onEditCard,
  columnId,
  triggerHapticFeedback,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'Card', columnId: columnId }, // Add type and columnId to data
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <motion.div // Envolve o CardContainer com motion.div
      ref={setNodeRef}
      style={style}
      layout // Permite animações de layout com o dnd-kit
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/service-orders/${card.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <CardContainer> {/* CardContainer não precisa mais do ref e style diretamente */}
          <DragHandle {...attributes} {...listeners}>
            <FaBars />
            <h3>{card.title}</h3>
          </DragHandle>
          {card.description && <p>{card.description}</p>}
          {card.assignee && (
            <AssigneeContainer>
              <FaUser />
              <span>{card.assignee.name}</span>
            </AssigneeContainer>
          )}
          {card.due_date && (
            <DueDateContainer>
              <FaCalendarAlt />
              <span>{new Date(card.due_date).toLocaleDateString()}</span>
            </DueDateContainer>
          )}
          <CardActions>
            <ActionButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditCard(card);
              }}
              aria-label="Edit card"
            >
              <FaEdit />
            </ActionButton>
            <ActionButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteCard(card.id, columnId);
              }}
              aria-label="Delete card"
            >
              <FaTrash />
            </ActionButton>
          </CardActions>
        </CardContainer>
      </Link>
    </motion.div>
  );
};

export default KanbanCard;
