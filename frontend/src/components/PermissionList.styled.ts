import styled from 'styled-components';
import { motion } from 'framer-motion';

export const StyledTableContainer = styled(motion.div)`
  overflow-x: auto;
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const StyledTable = styled(motion.table)`
  min-width: 100%;
  border-collapse: collapse;
`;

export const StyledTableHead = styled(motion.thead)`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onBackground};
  text-align: left;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.labelLarge?.fontSize || '14px'};
  line-height: ${({ theme }) => theme.typography.labelLarge?.lineHeight || '20px'};
  font-weight: ${({ theme }) => theme.typography.labelLarge?.fontWeight || 500};

  th {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}20;
  }
`;

export const StyledTableBody = styled(motion.tbody)`
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2?.fontSize || '14px'};
  line-height: ${({ theme }) => theme.typography.body2?.lineHeight || '20px'};
  font-weight: ${({ theme }) => theme.typography.body2?.fontWeight || 400};

  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}10;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.onSurface}05; // 5% opacity
    }
  }

  td {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`;

export const ActionButton = styled(motion.button)`
  background: none;
  border: none;
  color: ${({ theme, color }) => (color === 'edit' ? theme.colors.info : theme.colors.error)};
  cursor: pointer;
  font-size: 18px;
  padding: ${({ theme }) => theme.spacing.xxs};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme, color }) =>
      color === 'edit' ? theme.colors.info : theme.colors.error}1A; // 10% opacity
  }

  &:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;
