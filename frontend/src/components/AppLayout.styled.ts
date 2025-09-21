
import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const ContentArea = styled.div<{ sidebarOpen: boolean }>`
  flex-grow: 1;
  display: flex;
  padding-top: 64px; /* Altura da Topbar */
  transition: margin-left 0.3s ease-in-out;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: ${({ sidebarOpen }) => (sidebarOpen ? '250px' : '0')};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: 0; // Sidebar will overlay on smaller screens
  }
`;

export const MainContentArea = styled.main`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onBackground};
`;
