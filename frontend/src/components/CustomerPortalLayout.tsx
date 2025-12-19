import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f2f5; /* Light gray background */
  font-family: 'Roboto', sans-serif;
  color: #333;
`;

const Header = styled.header`
  background-color: #007bff; /* Primary blue */
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5em;
`;

const MainContent = styled.main`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Footer = styled.footer`
  background-color: #343a40; /* Dark gray */
  color: white;
  text-align: center;
  padding: 15px 20px;
  position: relative;
  bottom: 0;
  width: 100%;
  margin-top: 40px;
`;

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const CustomerPortalLayout: React.FC<CustomerPortalLayoutProps> = ({ children, title = 'Portal do Cliente Redecell' }) => {
  return (
    <LayoutContainer>
      <Header>
        <Title>{title}</Title>
      </Header>
      <MainContent>
        {children}
      </MainContent>
      <Footer>
        &copy; {new Date().getFullYear()} Redecell. Todos os direitos reservados.
      </Footer>
    </LayoutContainer>
  );
};

export default CustomerPortalLayout;
