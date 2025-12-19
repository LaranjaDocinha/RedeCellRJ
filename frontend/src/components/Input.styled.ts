import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const InputContainer = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const InputErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 12px;
  margin-top: ${({ theme }) => theme.spacing.xxs};
  margin-left: 14px; // Alinhar com o padding do input
`;

export const InputHelperText = styled.p`
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  font-size: 12px;
  margin-top: ${({ theme }) => theme.spacing.xxs};
  margin-left: 14px; // Alinhar com o padding do input
`;

export const InputLabel = styled.label<{ $shouldFloat?: boolean }>`
  position: absolute;
  pointer-events: none;
  transform-origin: top left;
  transition:
    transform 0.2s ease-out,
    color 0.2s ease-out;
  font-family: ${({ theme }) => theme.typography.primaryFont};
  font-size: 14px; // Body Medium
  color: ${({ theme }) => theme.colors.onSurface};
  left: 16px; // Posição inicial dentro do input (igual ao padding-left do input)
  top: 50%; // Centralizar verticalmente
  transform: translateY(-50%); // Ajuste para centralização

  ${({ theme, $shouldFloat }) =>
    $shouldFloat &&
    css`
      transform: translateY(-160%) scale(0.75); // Mover para cima e diminuir
      color: ${theme.colors.primary}; // Cor do label quando flutuando
      background-color: ${theme.colors.surface}; // Fundo para o label flutuante
      padding: 0 ${theme.spacing.xxs}; // Pequeno padding para o fundo
      left: 16px; // Ajustar posição horizontal quando flutuando
      border-radius: 4px; // Adicionar border-radius ao fundo do label flutuante
    `}
`;

export const InputWrapper = styled.div<{
  $isErrored?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  $isFocused?: boolean;
}>`
  // Adicionar $isFocused
  display: flex;
  align-items: center;
  border: 1px solid
    ${({ theme, $isErrored }) => ($isErrored ? theme.colors.error : theme.colors.onSurfaceVariant)};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surface};
  transition:
    border-color 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
  position: relative;

  ${({ theme, $isErrored }) =>
    $isErrored &&
    css`
      border-color: ${theme.colors.error};
      box-shadow: 0 0 0 2px ${`${theme.colors.error}33`};
    `}

  &:focus-within {
    border-color: ${({ theme, $isErrored }) =>
      $isErrored ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ theme, $isErrored }) =>
        $isErrored ? `${theme.colors.error}4D` : `${theme.colors.primary}4D`};
  }

  ${({ theme, disabled, readOnly }) =>
    (disabled || readOnly) &&
    css`
      background-color: ${theme.colors.surfaceVariant};
      cursor: not-allowed;
      opacity: 0.7;
    `}

  .input-adornment {
    display: flex;
    align-items: center;
    padding: 0 ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
  }
`;

export const StyledInput = styled(motion.input)<{
  $hasError?: boolean;
  size: 'small' | 'medium' | 'large';
}>`
  flex-grow: 1;
  border: none;
  outline: none;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.onSurface};
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.typography.primaryFont};
  transition: color 0.2s;
  min-height: 56px; // Altura padrão do Material Design para inputs
  padding-top: 24px; // Ajustar padding para acomodar o label flutuante
  padding-bottom: 8px; // Ajustar padding para acomodar o label flutuante

  &:focus {
    outline: none;
    border-color: transparent;
    box-shadow: none;
  }

  &:disabled,
  &:read-only {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
  }

  ${(props) => getSizeStyles(props)}
`;

const getSizeStyles = ({ size }: { size: 'small' | 'medium' | 'large' }) => {
  switch (size) {
    case 'large':
      return css`
        font-size: 16px;
        padding-left: 16px;
        padding-right: 16px;
      `;
    case 'medium':
      return css`
        font-size: 14px;
        padding-left: 16px;
        padding-right: 16px;
      `;
    case 'small':
      return css`
        font-size: 12px;
        min-height: 40px;
        padding-top: 16px;
        padding-bottom: 4px;
        padding-left: 12px;
        padding-right: 12px;
      `;
    default:
      return css``;
  }
};
