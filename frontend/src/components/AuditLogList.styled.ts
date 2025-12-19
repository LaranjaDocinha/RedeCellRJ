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
  font-family: ${({ theme }) => theme.typography.button.fontFamily};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
  line-height: ${({ theme }) => theme.typography.button.lineHeight};
  font-weight: ${({ theme }) => theme.typography.button.fontWeight};

  th {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}20;
  }
`;

export const StyledTableBody = styled(motion.tbody)`
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: ${({ theme }) => theme.typography.body2.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  line-height: ${({ theme }) => theme.typography.body2.lineHeight};
  font-weight: ${({ theme }) => theme.typography.body2.fontWeight};

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

export const StyledEmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.onSurface}80;
  font-size: ${({ theme }) => theme.typography.subtitle2.fontSize};
  text-align: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  margin-top: ${({ theme }) => theme.spacing.lg};

  svg {
    font-size: 48px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;
