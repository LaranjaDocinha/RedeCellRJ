import React from 'react';
import styled from 'styled-components';

const WidgetWrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  color: #333;
  height: 100%;
  display: flex;
  flex-direction: column;

  /* Adaptação para o tema dark do seu projeto, se houver */
  body.dark-mode & {
    background: rgba(40, 40, 40, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
    color: #f1f1f1;
  }
`;

const WidgetTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: inherit;
`;

const WidgetContent = styled.div`
  flex-grow: 1;
`;

const WidgetContainer = ({ title, children }) => {
  return (
    <WidgetWrapper>
      {title && <WidgetTitle>{title}</WidgetTitle>}
      <WidgetContent>{children}</WidgetContent>
    </WidgetWrapper>
  );
};

export default WidgetContainer;
