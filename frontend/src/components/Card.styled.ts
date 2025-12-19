import styled, { css } from 'styled-components';

export const StyledCard = styled.div<{
  elevation: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
}>`
  // Adicionar interactive
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.spacing.xs};

  ${({ theme, elevation }) =>
    elevation !== 'none' &&
    css`
      box-shadow: ${theme.shadows[elevation]};
    `}

  padding: ${({ theme }) => theme.spacing.md};
  transition:
    box-shadow 0.3s ease-in-out,
    background-color 0.3s ease-in-out; // Adicionar transição

  ${({ theme, interactive }) =>
    interactive &&
    css`
      cursor: pointer;
      &:hover {
        box-shadow: ${theme.shadows.md}; // Aumentar elevação no hover
        background-color: ${theme.colors.surfaceVariant}; // Mudar background sutilmente
      }
    `}
`;

export const StyledCardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledCardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

export const StyledCardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.outline};
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const StyledCardActions = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  justify-content: flex-end;
`;
