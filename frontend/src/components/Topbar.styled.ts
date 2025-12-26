import styled from 'styled-components';

export const StyledTopbar = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    height: 56px;
    padding: 0 16px;
  }
`;

export const TopbarBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.palette.text.primary};
  cursor: pointer;
  font-size: 20px;
  padding: 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }

  &.hamburger-btn {
    background-color: ${({ theme }) => theme.palette.primary.main}15;
    color: ${({ theme }) => theme.palette.primary.main};

    &:hover {
      background-color: ${({ theme }) => theme.palette.primary.main}25;
    }
  }
`;

export const TopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
