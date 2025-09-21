
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardContainer, CardActions, CardActionButton } from './Kanban.styled';
import { FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Import motion

interface Card {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  assignee_id?: number;
  column_id: string;
  position: number;
}

interface KanbanCardProps {
  card: Card;
  onDeleteCard: (cardId: string, columnId: string) => void;
  onEditCard: (card: Card) => void; // New prop for editing
  columnId: string;
  triggerHapticFeedback: () => void; // Add triggerHapticFeedback
}

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const KanbanCard: React.FC<KanbanCardProps> = ({ card, onDeleteCard, columnId, triggerHapticFeedback }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    boxShadow: isDragging ? '0 15px 30px rgba(0,0,0,0.3)' : undefined,
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout // For smooth reordering animations
    >
      <CardContainer ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <p className="font-semibold">{card.title}</p>
        {card.description && <p className="text-sm text-gray-600">{card.description}</p>}
        {card.due_date && <p className="text-xs text-gray-500">Due: {new Date(card.due_date).toLocaleDateString()}</p>}
        {card.assignee_id && <p className="text-xs text-gray-500">Assignee ID: {card.assignee_id}</p>}
        <CardActions>
          <CardActionButton onClick={() => onEditCard(card)}>
            Edit
          </CardActionButton>
          <CardActionButton onClick={() => onDeleteCard(card.id, columnId)}>
            <FaTrash />
          </CardActionButton>
        </CardActions>
      </CardContainer>
    </motion.div>
  );
};

export default KanbanCard;
