import React from 'react';
import { FaBug } from 'react-icons/fa';
import styled from 'styled-components';
import { showReportDialog } from '@sentry/react'; // Importar showReportDialog

const StyledFeedbackButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.elevation2};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryVariant};
  }
`;

const FeedbackButton: React.FC = () => {
  const handleClick = () => {
    showReportDialog();
  };

  return (
    <StyledFeedbackButton onClick={handleClick} aria-label="Report a bug or send feedback">
      <FaBug />
    </StyledFeedbackButton>
  );
};

export default FeedbackButton;
