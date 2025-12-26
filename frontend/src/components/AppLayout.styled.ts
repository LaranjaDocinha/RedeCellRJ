import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

export const ContentArea = styled.div<{ $sidebarOpen: boolean; $isCompact: boolean }>`
  flex-grow: 1;
  display: flex;
  padding-top: 64px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Ajuste dinâmico da margem com base na sidebar */
  margin-left: ${({ $sidebarOpen, $isCompact }) => 
    !$sidebarOpen ? '0' : ($isCompact ? '80px' : '280px')};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding-top: 56px;
    margin-left: 0;
  }
`;

export const MainContentArea = styled.main`
  flex-grow: 1;
  padding: 5px; // Reduzido para o limite de compactação
  background-color: ${({ theme }) => theme.palette.background.default};
  color: ${({ theme }) => theme.palette.text.primary};
  min-height: calc(100vh - 72px); 
  overflow-x: hidden;
`;
