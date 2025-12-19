import styled from 'styled-components';
import { motion } from 'framer-motion';

export const StyledTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  th,
  td {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}1A; // 10% opacity
  }

  th {
    background-color: ${({ theme }) => theme.colors.background};
    font-weight: bold;
    text-transform: uppercase;
    font-size: ${({ theme }) => theme.typography.button.fontSize};
    color: ${({ theme }) => theme.colors.onBackground};
  }

  tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.onSurface}08; // 5% opacity
  }

  .no-data {
    text-align: center;
    font-style: italic;
    color: ${({ theme }) => theme.colors.onSurface}99;
  }
`;

export const StyledTableControls = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};

  > div {
    flex-grow: 1;
  }
`;
