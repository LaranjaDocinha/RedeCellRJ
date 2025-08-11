import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';
import { Button, Input, Form } from 'reactstrap';

import KanbanCard from './KanbanCard';

const ColumnContainer = styled.div`
  flex: 0 0 320px;
  margin: 0 0.5rem;
  border-radius: 8px;
  background-color: var(--bs-tertiary-bg); /* Usar variável CSS */
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 250px);
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  font-weight: bold;
  border-bottom: 1px solid var(--bs-border-color-translucent); /* Usar variável CSS */
  background-color: ${({ $isWipExceeded }) => ($isWipExceeded ? 'var(--bs-danger-bg-subtle)' : 'transparent')}; /* Usar variável CSS */
  color: ${({ $isWipExceeded }) => ($isWipExceeded ? 'var(--bs-danger-text-emphasis)' : 'inherit')}; /* Usar variável CSS */
  transition: background-color 0.3s ease;
`;

const WipLimit = styled.span`
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--bs-secondary-color); /* Usar variável CSS */
`;

const CardList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  padding: 0.5rem;
  min-height: 100px;
  background-color: ${(props) => (props.$isDraggingOver ? 'var(--bs-tertiary-bg)' : 'inherit')}; /* Usar variável CSS */
`;

const QuickAddForm = styled(Form)`
  padding: 0.5rem;
`;

const KanbanColumn = ({
  column,
  tasks,
  onTaskClick,
  onTaskAdd,
  droppableId,
  onCardAction,
  kanbanViewMode,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [cardContent, setCardContent] = useState('');

  const wipLimit = column.wip_limit;
  const isWipExceeded = wipLimit > 0 && tasks.length > wipLimit;

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (cardContent.trim()) {
      onTaskAdd(column.id, cardContent);
      setCardContent('');
      setIsAdding(false);
    }
  };

  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <ColumnContainer>
      <ColumnHeader $isWipExceeded={isWipExceeded}>
        <div>
          <span>
            {column.title} ({tasks.length})
          </span>
          {wipLimit > 0 && <WipLimit> / {wipLimit}</WipLimit>}
        </div>
        {!isAdding && (
          <Button color='light' size='sm' onClick={handleAddClick}>
            <i className='bx bx-plus'></i>
          </Button>
        )}
      </ColumnHeader>
      <CardList ref={setNodeRef} $isDraggingOver={isOver}>
        {tasks.map((task, index) => (
          <KanbanCard
            key={task.id}
            index={index}
            kanbanViewMode={kanbanViewMode}
            task={task}
            onCardAction={onCardAction}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </CardList>
      {isAdding && (
        <QuickAddForm onSubmit={handleFormSubmit}>
          <Input
            placeholder='Digite o nome do cliente e o defeito...'
            type='textarea'
            value={cardContent}
            onBlur={() => setIsAdding(false)}
            onChange={(e) => setCardContent(e.target.value)}
          />
          <Button className='mt-2' color='primary' size='sm' type='submit'>
            Adicionar
          </Button>
          <Button
            className='mt-2 ms-2'
            color='secondary'
            size='sm'
            onClick={() => setIsAdding(false)}
          >
            Cancelar
          </Button>
        </QuickAddForm>
      )}
    </ColumnContainer>
  );
};

export default KanbanColumn;
