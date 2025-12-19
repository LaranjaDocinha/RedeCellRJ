import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const ContentArea = styled.div<{ $sidebarOpen: boolean }>`
  flex-grow: 1;
  display: flex;
  padding-top: 64px; /* Altura da Topbar */
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${({ $sidebarOpen }) => ($sidebarOpen ? '250px' : '0')};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding-top: 56px; // Ajustar para a nova altura da Topbar em telas menores
  }
`;

export const MainContentArea = styled.main`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onBackground};
`;
