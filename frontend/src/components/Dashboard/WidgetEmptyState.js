import React from 'react';
import styled from 'styled-components';
import { Info } from 'react-feather';

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #999;
  height: 100%;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 16px;

  body.dark-mode & {
    color: #777;
    border-color: #444;
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 0.9rem;
  margin: 0;
`;

const WidgetEmptyState = ({ message = 'Sem dados para exibir.' }) => {
  return (
    <EmptyStateWrapper>
      <IconWrapper>
        <Info size={32} />
      </IconWrapper>
      <Message>{message}</Message>
    </EmptyStateWrapper>
  );
};

export default WidgetEmptyState;
