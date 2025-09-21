
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

interface StyledButtonProps {
  variant: 'contained' | 'outlined' | 'text';
  color: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
}

const colorMap = {
  primary: 'primary',
  secondary: 'secondary',
  danger: 'error',
};

const getVariantStyles = ({ theme, color: colorProp, variant }: StyledButtonProps & { theme: any }) => {
  const mainColor = theme.colors[colorMap[colorProp]];
  const onColor = colorProp === 'primary' ? theme.colors.onPrimary : theme.colors.onSecondary;

  switch (variant) {
    case 'contained':
      return css`
        background-color: ${mainColor};
        color: ${colorProp === 'danger' ? theme.colors.onPrimary : onColor};
        border: 1px solid ${mainColor};
        &:hover:not(:disabled) {
          filter: brightness(1.1);
        }
      `;
    case 'outlined':
      return css`
        background-color: transparent;
        color: ${mainColor};
        border: 1px solid ${mainColor};
        &:hover:not(:disabled) {
          background-color: ${mainColor}14; // ~8% opacity
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: ${mainColor};
        border: 1px solid transparent;
        &:hover:not(:disabled) {
          background-color: ${mainColor}14; // ~8% opacity
        }
      `;
    default:
      return css``;
  }
};

const getSizeStyles = ({ size }: StyledButtonProps) => {
  switch (size) {
    case 'large':
      return css`
        font-size: 16px;
        padding: 12px 24px;
      `;
    case 'medium':
      return css`
        font-size: 14px;
        padding: 11px 20px;
      `;
    case 'small':
      return css`
        font-size: 12px;
        padding: 10px 16px;
      `;
    default:
      return css``;
  }
};

export const StyledButton = styled(motion.button)<StyledButtonProps>`
  font-family: ${({ theme }) => theme.typography.secondaryFont};
  font-weight: 700;
  border-radius: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  display: inline-block;
  line-height: 1;
  transition: all 0.2s ease-in-out;

  ${(props) => getVariantStyles(props)}
  ${(props) => getSizeStyles(props)}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
