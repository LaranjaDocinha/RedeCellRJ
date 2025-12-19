import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const SwitchContainer = styled.div`
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

export const StyledSwitch = styled.div.withConfig({
  shouldForwardProp: (prop) => !['error', 'checked'].includes(prop),
})<{
  checked: boolean;
  error: boolean;
}>`
  width: 40px; // Largura do trilho
  height: 22px; // Altura do trilho
  border-radius: 11px; // Metade da altura para bordas arredondadas
  background-color: ${({ theme, checked, error }) =>
    error ? theme.colors.error : checked ? theme.colors.primary : theme.colors.onSurfaceVariant};
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  flex-shrink: 0; // Evita que o switch encolha
  position: relative; // Para posicionar o thumb

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

export const SwitchThumb = styled(motion.div)`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.24);
  position: absolute;
  left: 2px; // Posição inicial
`;

export const SwitchLabel = styled.label`
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

export const SwitchErrorMessage = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.error};
  margin-left: calc(40px + ${({ theme }) => theme.spacing.xs}); // Alinhar com o label
  margin-top: ${({ theme }) => theme.spacing.xxs};
  display: block;
`;
