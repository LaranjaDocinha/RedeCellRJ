
import styled from 'styled-components';

export const WidgetContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.elevation2};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  h2 {
    margin-top: 0;
    color: ${({ theme }) => theme.colors.onSurface};
    font-size: 1.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}11;
    padding-bottom: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;
