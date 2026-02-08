import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { RocketLaunch } from '@mui/icons-material';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
`;

const Content = styled.main`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoText = styled.h1`
  margin: 0;
  font-weight: 300;
  letter-spacing: 2px;
`;

interface KioskLayoutProps {
  children: ReactNode;
  title?: string;
}

const KioskLayout: React.FC<KioskLayoutProps> = ({ children, title = 'Autoatendimento' }) => {
  return (
    <LayoutContainer>
      <Header>
        <RocketLaunch fontSize="large" />
        <LogoText>REDECELL RJ</LogoText>
      </Header>
      <Content>
        {children}
      </Content>
    </LayoutContainer>
  );
};

export default KioskLayout;
