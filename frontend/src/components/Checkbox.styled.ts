import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

export const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Ocultar visualmente o checkbox nativo, mas mantê-lo acessível
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export const StyledCheckbox = styled.label.withConfig({
  shouldForwardProp: (prop) => !['error', 'checked', 'disabled'].includes(prop),
})<{
  checked: boolean;
  error?: boolean;
  disabled?: boolean;
}>`
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 2px solid
    ${({ theme, checked, error }) =>
      error ? theme.colors.error : checked ? theme.colors.primary : theme.colors.onSurfaceVariant};
  background-color: ${({ theme, checked }) =>
    checked ? theme.colors.primary : theme.colors.surface};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0; // Evita que o checkbox encolha

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}80;
    outline: none;
  }

  ${HiddenCheckbox}:disabled + & {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
  }
`;

export const CheckmarkIcon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2;
  width: 16px;
  height: 16px;
`;

export const CheckboxLabel = styled.label`
  margin-left: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;

  ${HiddenCheckbox}:disabled ~ & {
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
    cursor: not-allowed;
  }
`;

export const CheckboxErrorMessage = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.error};
  margin-left: calc(20px + ${({ theme }) => theme.spacing.xs}); // Alinhar com o label
  margin-top: ${({ theme }) => theme.spacing.xxs};
  display: block;
`;
