
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

// KanbanBoard styles
export const BoardContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 20px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surface} 100%);
  min-height: 100vh;
  align-items: flex-start;
  overflow-x: auto;
  white-space: nowrap;

  & > * {
    flex-shrink: 0;
  }
`;

export const AddColumnButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: ${({ theme }) => theme.spacing.xs};
  padding: 10px 15px;
  cursor: pointer;
  font-size: 1em;
  white-space: nowrap;
  margin-top: 10px;
  align-self: flex-start;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
`;

// KanbanColumn styles
export const ColumnContainer = styled(motion.div)<{ $isWipLimitExceeded: boolean }>`
  background-color: ${({ theme, $isWipLimitExceeded }) => ($isWipLimitExceeded ? theme.colors.error : theme.colors.surface)};
  border: 2px solid ${({ theme, $isWipLimitExceeded }) => ($isWipLimitExceeded ? theme.colors.error : 'transparent')};
  border-radius: ${({ theme }) => theme.spacing.xs};
  padding: 10px;
  width: 280px;
  min-width: 280px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, background-color 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 8px;
`;

export const ColumnTitle = styled.h3`
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const ColumnTitleInput = styled.input`
  font-size: 1.2em;
  font-weight: bold;
  border: 1px solid ${({ theme }) => theme.colors.onSurface}4D;
  border-radius: 4px;
  padding: 4px;
  width: calc(100% - 30px);
`;

export const ColumnRemoveButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5em;
  color: ${({ theme }) => theme.colors.onSurface}99;
  cursor: pointer;
  padding: 0 5px;

  &:hover {
    color: ${({ theme }) => theme.colors.onSurface};
  }
`;

export const CardList = styled.div<{ $isDraggingOver: boolean }>`
  flex-grow: 1;
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${({ $isDraggingOver }) => ($isDraggingOver ? '#c7d0d9' : 'transparent')};
  border: 2px dashed ${({ $isDraggingOver, theme }) => ($isDraggingOver ? theme.colors.primary : 'transparent')};
  border-radius: ${({ theme }) => theme.spacing.xs};
`;

export const AddCardSection = styled.div`
  display: flex;
  gap: 5px;
  padding: 8px;
`;

export const AddCardInput = styled.input`
  flex-grow: 1;
  border: 1px solid ${({ theme }) => theme.colors.onSurface}4D;
  border-radius: 4px;
  padding: 8px;
`;

export const AddCardButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export const WipLimitMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
`;

// KanbanCard styles
export const CardContainer = styled(motion.div)<{ $isDragging: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  cursor: grab;
  position: relative;

  &:active {
    cursor: grabbing;
  }

  ${({ $isDragging }) => $isDragging && css`
    background-color: #e6fcff;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transform: rotate(2deg);
  `}
`;

export const CardContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  p {
    flex-grow: 1;
    margin: 0;
    cursor: pointer;
  }
`;

export const CardTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  border: 1px solid ${({ theme }) => theme.colors.onSurface}4D;
  border-radius: 4px;
  padding: 5px;
  resize: vertical;
`;

export const CardRemoveButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2em;
  color: ${({ theme }) => theme.colors.onSurface}99;
  cursor: pointer;
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${CardContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.onSurface};
  }
`;

// KanbanCardPlaceholder styles
export const CardPlaceholder = styled.div`
  background-color: ${({ theme }) => theme.colors.primary}33;
  border: 1px dashed ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  height: 40px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
`;
