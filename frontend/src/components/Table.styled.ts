import styled from 'styled-components';

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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.spacing.xxs};

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
    font-size: 0.85em;
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