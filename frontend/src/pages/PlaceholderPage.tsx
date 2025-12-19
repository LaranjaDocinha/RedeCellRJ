import React from 'react';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <StyledPageContainer>
      <StyledPageTitle>{title}</StyledPageTitle>
      <p>Esta página está em desenvolvimento.</p>
    </StyledPageContainer>
  );
};

export default PlaceholderPage;
