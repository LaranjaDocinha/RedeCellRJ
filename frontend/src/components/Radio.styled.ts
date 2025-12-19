import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const RadioContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

export const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  // Ocultar visualmente o radio nativo, mas mantê-lo acessível
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

export const StyledRadio = styled.div.withConfig({
  shouldForwardProp: (prop) => !['error', 'checked'].includes(prop),
})<{
  checked: boolean;
  error: boolean;
}>`
  width: 20px;
  height: 20px;
  border-radius: 50%; // Círculo
  border: 2px solid
    ${({ theme, checked, error }) =>
      error ? theme.colors.error : checked ? theme.colors.primary : theme.colors.onSurfaceVariant};
  background-color: ${({ theme }) => theme.colors.surface};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0; // Evita que o radio encolha

  ${HiddenRadio}:focus + & {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}80;
    outline: none;
  }

  ${HiddenRadio}:disabled + & {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.surfaceVariant};
  }
`;

export const RadioDot = styled(motion.div)`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const RadioLabel = styled.label`
  margin-left: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;

  ${HiddenRadio}:disabled ~ & {
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
    cursor: not-allowed;
  }
`;

export const RadioErrorMessage = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.error};
  margin-left: calc(20px + ${({ theme }) => theme.spacing.xs}); // Alinhar com o label
  margin-top: ${({ theme }) => theme.spacing.xxs};
  display: block;
`;
