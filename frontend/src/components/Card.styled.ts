
import styled from 'styled-components';

export const StyledCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.spacing.xs}; // Assuming medium radius is xs spacing
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.onSurface};
`;
