import React from 'react';
import styled from 'styled-components';

const WidgetWrapper = styled.div`
  background: var(--color-component-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
  color: var(--color-body-text);
  height: 100%;
  display: flex;
  flex-direction: column;

  /* Adaptação para o tema dark do seu projeto, se houver */
  [data-bs-theme="dark"] & {
    background: var(--color-component-bg);
    border-color: var(--color-border);
    color: var(--color-body-text);
  }
`;

const WidgetTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-body-text);
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
