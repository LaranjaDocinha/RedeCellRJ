import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const BoardContainer = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  height: calc(100vh - 200px); // Ajustar conforme a altura da topbar e outros elementos
  align-items: flex-start; // Alinha as colunas ao topo
`;

export const ColumnContainer = styled(motion.div)`
  min-width: 300px;
  max-height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ColumnHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const StyledColumnTitle = styled(motion.h2)`
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
  color: ${({ theme }) => theme.colors.onBackground};
  margin: 0;
`;

export const CardCountBadge = styled(motion.span)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: 50%;
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.typography.overline.fontSize};
  font-weight: bold;
`;

export const CardsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 100px; // To make it a valid drop target even when empty
`;

export const CardContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: grab;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.elevation2};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.subtitle2.fontSize};
    line-height: ${({ theme }) => theme.typography.subtitle2.lineHeight};
    font-weight: ${({ theme }) => theme.typography.subtitle2.fontWeight};
    color: ${({ theme }) => theme.colors.onSurface};
    margin: 0;
  }

  p {
    font-size: ${({ theme }) => theme.typography.caption.fontSize};
    line-height: ${({ theme }) => theme.typography.caption.lineHeight};
    font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
    color: ${({ theme }) => theme.colors.onSurface}80;
    margin: 0;
  }
`;

export const CardActions = styled(motion.div)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xxs};
  right: ${({ theme }) => theme.spacing.xxs};
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`;

export const ActionButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.onSurface}99;
  cursor: pointer;
  font-size: 16px;
  padding: ${({ theme }) => theme.spacing.xxs};
  border-radius: 50%;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.onSurface}14;
    color: ${({ theme }) => theme.colors.onSurface};
  }
`;

export const AddCardButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.primaryLight}22;
  color: ${({ theme }) => theme.colors.primaryDark};
  border: 1px dashed ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight}44;
  }
`;

export const AddCardForm = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface}CC;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
`;

export const AddCardTextArea = styled(motion.textarea)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xxs};
  border: 1px solid ${({ theme }) => theme.colors.onSurface}44;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onBackground};
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const AddCardActions = styled(motion.div)`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xxs};
`;

export const AddCardActionButton = styled(motion.button)<{ cancel?: boolean }>`
  padding: ${({ theme }) => theme.spacing.xxs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease-in-out;

  ${({ cancel, theme }) =>
    cancel
      ? css`
          background-color: ${theme.colors.error}22;
          color: ${theme.colors.error};
          &:hover {
            background-color: ${theme.colors.error}44;
          }
        `
      : css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.onPrimary};
          &:hover {
            background-color: ${theme.colors.primaryDark};
          }
        `}
`;

export const AssigneeContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.overline.fontSize};
  color: ${({ theme }) => theme.colors.onSurface}99;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const DueDateContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.overline.fontSize};
  color: ${({ theme }) => theme.colors.onSurface}99;

  svg {
    color: ${({ theme }) => theme.colors.warning};
  }
`;
