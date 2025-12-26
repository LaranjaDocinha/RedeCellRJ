import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps {
  label?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning';
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  primary?: boolean;
  style?: React.CSSProperties; // Adicionado suporte a style
}

// Usando shouldForwardProp para evitar que a prop 'primary' chegue ao DOM
const StyledMuiButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'primary',
})<{ primary?: boolean }>(({ theme, primary }) => ({
  ...(primary && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
}));

export const Button: React.FC<ButtonProps> = ({
  label,
  children,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary',
  primary,
  ...props
}) => {
  // Removemos props que não devem ir para o MuiButton se necessário, 
  // mas o StyledMuiButton com shouldForwardProp já resolve a maioria.
  
  return (
    <StyledMuiButton
      variant={variant}
      color={color}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" aria-label={label ? `${label} carregando` : 'Carregando'} /> : startIcon}
      endIcon={!loading && endIcon}
      primary={primary}
      aria-label={label || (typeof children === 'string' ? children : '')}
      {...props}
    >
      {!loading && (children || label)}
      {loading && <span className="sr-only">{label ? `${label} carregando` : 'Carregando'}</span>}
    </StyledMuiButton>
  );
};


export default Button;