
import React from 'react';
import { ErrorMessageContainer, ErrorMessageText, ErrorMessageDetails } from './ErrorMessage.styled';

interface ErrorMessageProps {
  message: string;
  details?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, details }) => {
  return (
    <ErrorMessageContainer>
      <ErrorMessageText>{message}</ErrorMessageText>
      {details && <ErrorMessageDetails>{details}</ErrorMessageDetails>}
    </ErrorMessageContainer>
  );
};

