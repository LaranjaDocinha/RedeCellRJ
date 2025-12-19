import React from 'react';
import { StyledNotFoundContainer, StyledNotFoundTitle, StyledNotFoundMessage, StyledNotFoundLink } from './NotFoundPage.styled';
import { FaQuestionCircle } from 'react-icons/fa';

const NotFoundPage: React.FC = () => {
  return (
    <StyledNotFoundContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <FaQuestionCircle size={80} color="#FFC107" />
      <StyledNotFoundTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        404
      </StyledNotFoundTitle>
      <StyledNotFoundMessage
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Oops! The page you're looking for doesn't exist.
      </StyledNotFoundMessage>
      <StyledNotFoundLink
        to="/"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        Go to Homepage
      </StyledNotFoundLink>
    </StyledNotFoundContainer>
  );
};

export default NotFoundPage;
