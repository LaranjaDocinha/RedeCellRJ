import styled, { css } from 'styled-components';

export const SidebarNavItem = styled.a<{ $isCompact?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ $isCompact }) => ($isCompact ? '0' : '12px')};
  padding: 10px 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.palette.text.secondary};
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', sans-serif !important;
  font-weight: 500 !important;
  font-size: 0.9rem;
  justify-content: ${({ $isCompact }) => ($isCompact ? 'center' : 'flex-start')};
  margin: 4px 12px;
  cursor: pointer;

  .sidebar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    min-width: 24px;
    color: ${({ theme }) => theme.palette.primary.main};
    transition: color 0.3s ease;
  }

  span {
    font-family: 'Inter', sans-serif !important;
    font-weight: 500 !important;
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.main}12;
    color: ${({ theme }) => theme.palette.primary.main};
    
    .sidebar-icon {
      transform: scale(1.1);
    }
  }

  &.active {
    background: linear-gradient(
      135deg, 
      ${({ theme }) => theme.palette.primary.main} 0%, 
      ${({ theme }) => theme.palette.primary.dark} 100%
    );
    color: ${({ theme }) => theme.palette.primary.contrastText};
    box-shadow: 0 8px 20px ${({ theme }) => theme.palette.primary.main}40;

    .sidebar-icon {
      color: ${({ theme }) => theme.palette.primary.contrastText};
    }
    
    span {
      color: ${({ theme }) => theme.palette.primary.contrastText};
      font-weight: 500 !important;
    }
  }
`;

export const StyledSidebar = styled.aside<{ $isOpen: boolean; $isCompact: boolean }>`
  width: ${({ $isCompact }) => ($isCompact ? '80px' : '280px')};
  background-color: ${({ theme }) => (theme as any).glass?.background || theme.palette.background.paper};
  backdrop-filter: ${({ theme }) => (theme as any).glass?.blur || 'none'};
  position: fixed;
  top: 64px;
  left: ${({ $isOpen }) => ($isOpen ? '0' : '-280px')};
  height: calc(100vh - 64px);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  border-right: ${({ theme }) => (theme as any).glass?.border || `1px solid ${theme.palette.divider}`};
  overflow: hidden;

  @media (max-width: 768px) {
    top: 56px;
    height: calc(100vh - 56px);
  }
`;

export const SidebarNav = styled.nav`
  flex-grow: 1;
  padding: 12px 0;
  overflow-y: auto;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.divider};
    border-radius: 10px;
  }
`;

export const SidebarNavGroup = styled.div`
  margin-bottom: 20px;
`;

export const SidebarNavGroupTitle = styled.h3`
  font-family: 'Inter', sans-serif !important;
  font-size: 0.7rem;
  font-weight: 600 !important;
  color: ${({ theme }) => theme.palette.text.disabled};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 0 24px;
  margin: 16px 0 8px;
  opacity: 0.8;
`;

export const SidebarSearchInput = styled.input`
  width: calc(100% - 32px);
  padding: 12px 16px;
  margin: 16px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.palette.background.default};
  color: ${({ theme }) => theme.palette.text.primary};
  font-family: 'Inter', sans-serif !important;
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.palette.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.palette.primary.main}15;
  }
`;

export const SidebarCloseBtn = styled.button`
  display: none;
`;

export const ExternalLinkIcon = styled.span`
  margin-left: auto;
  font-size: 0.7rem;
  opacity: 0.5;
`;
