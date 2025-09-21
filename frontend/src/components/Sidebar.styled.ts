
import styled from 'styled-components';

export const StyledSidebar = styled.aside<{ isOpen: boolean }>`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  position: fixed;
  top: 0;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: left 0.3s ease-in-out;
  z-index: 1100;
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    left: ${({ isOpen }) => (isOpen ? '0' : '-250px')};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    left: ${({ isOpen }) => (isOpen ? '0' : '-250px')};
  }
`;

export const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.onSurface}1F; // 12% opacity
`;

export const SidebarTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  margin: 0;
`;

export const SidebarCloseBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 50%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.onSurface}14; // 8% opacity
  }
`;

export const SidebarNav = styled.nav`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacing.sm};

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

export const SidebarNavItem = styled.a`
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: inherit;
  border-radius: ${({ theme }) => theme.spacing.xs};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.onSurface}14; // 8% opacity
  }
`;
