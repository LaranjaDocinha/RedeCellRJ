import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled, { css } from 'styled-components';
import { Badge, Progress } from 'reactstrap';
import { differenceInDays } from 'date-fns';
import { CheckSquare, Paperclip } from 'react-feather';
import { motion } from 'framer-motion';
import { useContextMenu, Menu } from 'react-contexify';

import KanbanCardContextMenu from './KanbanCardContextMenu';

// --- Componente Avatar ---
const AvatarContainer = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Avatar = ({ src, name }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    const initials = names.map((n) => n[0]).join('');
    return initials.toUpperCase().substring(0, 2);
  };

  return (
    <AvatarContainer title={name}>
      {src ? <img alt={name} src={src} /> : <span>{getInitials(name)}</span>}
    </AvatarContainer>
  );
};

// --- Lógica de Estilo do Card ---
const getDeadlineIndicatorStyle = (statusUpdatedAt) => {
  if (!statusUpdatedAt) return '';
  const daysSinceUpdate = differenceInDays(new Date(), new Date(statusUpdatedAt));
  if (daysSinceUpdate > 5)
    return css`
      border-left: 5px solid #dc3545;
    `;
  if (daysSinceUpdate > 3)
    return css`
      border-left: 5px solid #ffc107;
    `;
  return '';
};

const getCardAgingStyle = (statusUpdatedAt) => {
  if (!statusUpdatedAt) return '';
  const daysSinceUpdate = differenceInDays(new Date(), new Date(statusUpdatedAt));

  if (daysSinceUpdate > 10)
    return css`
      opacity: 0.6;
    `;
  if (daysSinceUpdate > 7)
    return css`
      opacity: 0.75;
    `;
  if (daysSinceUpdate > 5)
    return css`
      opacity: 0.9;
    `;
  return '';
};

// --- Componentes Estilizados do Card ---
const CardContainer = styled(motion.div)`
  background-color: var(--card-background-color); // Use theme variable for background
  border-radius: 4px;
  padding: ${({ kanbanViewMode }) => (kanbanViewMode === 'compact' ? '0.5rem' : '0.75rem')};
  margin-bottom: ${({ kanbanViewMode }) => (kanbanViewMode === 'compact' ? '0.25rem' : '0.5rem')};
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
  transition:
    box-shadow 0.3s,
    border-left 0.3s,
    opacity 0.5s;
  cursor: pointer;
  ${({ statusUpdatedAt }) => getDeadlineIndicatorStyle(statusUpdatedAt)}
  ${({ statusUpdatedAt }) => getCardAgingStyle(statusUpdatedAt)}

  &:hover {
    box-shadow:
      0 3px 6px rgba(0, 0, 0, 0.16),
      0 3px 6px rgba(0, 0, 0, 0.23);
    opacity: 1;
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.15rem 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 4px;
  color: #fff;
  background-color: ${(props) => props.color || '#6c757d'};
`;

const CardTitle = styled.h6`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardInfo = styled.p`
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  font-size: 0.75rem;
`;

const CardIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6c757d;
`;

const IconIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// --- Componentes (Avatar, Estilos, etc) ---
// ... (código dos componentes estilizados permanece o mesmo)

// --- Componente Principal do Card ---
const KanbanCard = ({ task, index, onClick, onCardAction, kanbanViewMode }) => {
  const contextMenuId = `card-context-menu-${task.id}`;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { show } = useContextMenu({ id: contextMenuId });

  const handleContextMenu = (event) => {
    show(event);
  };

  if (!task) return null;

  const isFinalState = task.status === 'Finalizado' || task.status === 'Cancelado';
  const statusUpdatedAt = isFinalState ? null : task.status_updated_at;

  const checklistItems = task.checklist_items || [];
  const completedItems = checklistItems.filter((item) => item.completed).length;
  const totalItems = checklistItems.length;
  const hasChecklist = totalItems > 0;
  const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const attachments = task.attachments || [];
  const hasAttachments = attachments.length > 0;

  const tags = task.tags || [];

  return (
    <>
      <CardContainer
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        layout
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.95 }}
        statusUpdatedAt={statusUpdatedAt}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        {tags.length > 0 && (
          <TagContainer>
            {tags.map((tag) => (
              <Tag key={tag.id} color={tag.color}>
                {tag.name}
              </Tag>
            ))}
          </TagContainer>
        )}

        <CardTitle>
          #{task.id} - {task.device_type}
        </CardTitle>
        <CardInfo title={task.customer_name}>{task.customer_name}</CardInfo>
        {!kanbanViewMode ||
          (kanbanViewMode === 'detailed' && (
            <CardInfo title={task.problem_description}>
              <strong>Defeito:</strong> {task.problem_description}
            </CardInfo>
          ))}

        {hasChecklist && (!kanbanViewMode || kanbanViewMode === 'detailed') && (
          <div className='mt-2'>
            <Progress style={{ height: '5px' }} value={checklistProgress} />
          </div>
        )}

        <CardFooter>
          <CardIcons>
            <Badge pill color='light'>
              {new Date(task.created_at).toLocaleDateString()}
            </Badge>
            {hasChecklist && (
              <IconIndicator>
                <CheckSquare size={14} />
                <span>
                  {completedItems}/{totalItems}
                </span>
              </IconIndicator>
            )}
            {hasAttachments && (
              <IconIndicator>
                <Paperclip size={14} />
                <span>{attachments.length}</span>
              </IconIndicator>
            )}
          </CardIcons>
          {task.technician_name && (
            <Avatar name={task.technician_name} src={task.technician_avatar_url} />
          )}
        </CardFooter>
      </CardContainer>
      <KanbanCardContextMenu
        id={contextMenuId}
        onAction={(action) => onCardAction(action, task.id)}
      />
    </>
  );
}

export default KanbanCard;
