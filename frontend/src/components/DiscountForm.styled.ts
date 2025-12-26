import styled from 'styled-components';
import { motion } from 'framer-motion';

export const StyledForm = styled(motion.form)`
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.elevation1};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const StyledFormField = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const StyledLabel = styled(motion.label)`
  font-size: ${({ theme }) => theme.typography.body2?.fontSize || '14px'};
  font-weight: ${({ theme }) => theme.typography.body2?.fontWeight || 400};
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledInput = styled(motion.input)`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.onSurface}30;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2?.fontSize || '14px'};
  color: ${({ theme }) => theme.colors.onSurface};
  background-color: ${({ theme }) => theme.colors.background};
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

export const StyledSelect = styled(motion.select)`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.onSurface}30;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2?.fontSize || '14px'};
  color: ${({ theme }) => theme.colors.onSurface};
  background-color: ${({ theme }) => theme.colors.background};
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

export const StyledTextArea = styled(motion.textarea)`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.onSurface}30;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2?.fontSize || '14px'};
  color: ${({ theme }) => theme.colors.onSurface};
  background-color: ${({ theme }) => theme.colors.background};
  transition: all 0.2s ease-in-out;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

export const StyledCheckboxContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const StyledCheckbox = styled(motion.input).attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  border: 1px solid ${({ theme }) => theme.colors.onSurface}30;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background};
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:checked {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }
`;

export const StyledButtonContainer = styled(motion.div)`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;
