import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const StyledToggleButton = styled(motion.button)<{ selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.typography.button.fontFamily};
  font-size: ${({ theme }) => theme.typography.button.fontSize};
  font-weight: ${({ theme }) => theme.typography.button.fontWeight};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceVariant};
  color: ${({ theme }) => theme.colors.onSurface};
  background-color: ${({ theme }) => theme.colors.surface};

  ${({ theme, selected }) =>
    selected &&
    css`
      background-color: ${theme.colors.primary};
      color: ${theme.colors.onPrimary};
      border-color: ${theme.colors.primary};
    `}

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}80;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .toggle-button-icon {
    display: flex;
    align-items: center;
  }
`;
