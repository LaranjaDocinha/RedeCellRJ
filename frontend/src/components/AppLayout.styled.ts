import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.palette.background.default};
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
`;

export const ContentArea = styled.div<{ $sidebarOpen: boolean; $isCompact: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 64px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: transparent;
  margin: 0;
  height: 100%;
  
  /* Ajuste dinâmico da margem com base na sidebar */
  margin-left: ${({ $sidebarOpen, $isCompact }) => 
    !$sidebarOpen ? '0' : ($isCompact ? '80px' : '280px')};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding-top: 56px;
    margin-left: 0;
  }
`;

export const MainContentArea = styled.main`
  flex: 1;
  padding: 0;
  margin: 0;
  background-color: transparent;
  color: ${({ theme }) => theme.palette.text.primary};
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
`;
