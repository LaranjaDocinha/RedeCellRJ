import styled from 'styled-components';
import { motion } from 'framer-motion';

export const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

export const ModalContent = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  border-radius: ${({ theme }) => theme.spacing.xs};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  padding: ${({ theme }) => theme.spacing.md};
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 400;
  margin: 0;
`;

export const ModalCloseBtn = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 50%;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.onSurface}14; // 8% opacity
  }
`;

export const ModalBody = styled.div`
  flex-grow: 1;
`;

