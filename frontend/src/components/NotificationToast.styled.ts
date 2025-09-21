
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

export const NotificationContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  z-index: 1300;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const StyledNotificationToast = styled(motion.div)<{ type: 'success' | 'error' | 'info' | 'warning' }>`
  padding: 12px 20px;
  border-radius: ${({ theme }) => theme.spacing.xxs};
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  color: #FFFFFF;
  font-family: ${({ theme }) => theme.typography.primaryFont};
  font-size: 14px;
  opacity: 0;
  transform: translateY(-20px);
  animation: ${slideIn} 0.3s forwards;

  ${({ type, theme }) => {
    switch (type) {
      case 'success':
        return `background-color: ${theme.colors.success};`;
      case 'error':
        return `background-color: ${theme.colors.error};`;
      case 'info':
        return `background-color: ${theme.colors.info};`;
      case 'warning':
        return `background-color: ${theme.colors.warning};`;
      default:
        return `background-color: ${theme.colors.primary};`;
    }
  }}
`;

export const NotificationMessage = styled.p`
  flex-grow: 1;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.2em;
  margin-left: 10px;
`;
