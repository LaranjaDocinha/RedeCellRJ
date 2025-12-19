import styled from 'styled-components';

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap; // Adicionado para quebrar linha em telas pequenas
`;

export const PageButton = styled.button<{ isActive?: boolean }>`
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.onPrimary : theme.colors.onSurface)};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme, isActive }) =>
      isActive ? theme.colors.primaryDark : theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.onPrimary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
