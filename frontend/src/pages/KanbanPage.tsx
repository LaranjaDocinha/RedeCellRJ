
import React from 'react';
import KanbanBoard from '../components/Kanban/KanbanBoard';

const KanbanPage: React.FC = () => {
  return (
    <div>
      <h1 data-tut="kanban-page-title">Quadro Kanban</h1>
      <p>Gerencie suas tarefas e ordens de serviço.</p>
      <KanbanBoard data-tut="kanban-board-container" />
    </div>
  );
};

export default KanbanPage;
