
import React from 'react';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled'; // Reutilizando componentes estilizados
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const StyledPageDescription = styled(motion.p)`
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.colors.onSurface}80;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const KanbanPage: React.FC = () => {
  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPageTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Quadro Kanban
      </StyledPageTitle>
      <StyledPageDescription
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Gerencie suas tarefas e ordens de serviço.
      </StyledPageDescription>
      <KanbanBoard data-tut="kanban-board-container" />
    </StyledPageContainer>
  );
};

export default KanbanPage;
