import styled from 'styled-components';

export const StyledTopbar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  height: 64px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 56px;
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

export const TopbarBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 20px;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
  }

  &.hamburger-btn {
    background-color: ${({ theme }) => theme.colors.primary}1A; // Subtle primary background
    border-radius: ${({ theme }) => theme.borderRadius.medium}; // Slightly rounded corners
    padding: 8px; // Adjust padding
    color: ${({ theme }) => theme.colors.primary}; // Use primary color for icon

    &:hover {
      background-color: ${({ theme }) => theme.colors.primary}33;
    }
  }
`;

export const TopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;