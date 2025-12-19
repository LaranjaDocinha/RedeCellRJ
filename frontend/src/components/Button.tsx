import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning'; // Changed 'danger' to 'error' for MUI palette
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean; // Changed $fullWidth to fullWidth for MUI prop
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  primary?: boolean; // Custom prop for primary color, if needed
}

const StyledMuiButton = styled(MuiButton)<{ primary?: boolean }>(({ theme, primary }) => ({
  // Custom styling if needed, otherwise MUI's default is good
  // For example, if 'primary' prop should always map to a specific color
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
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary', // Default color
  primary, // Destructure primary prop
  ...props
}) => {
  return (
    <StyledMuiButton
      variant={variant}
      color={color}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" aria-label={label ? `${label} carregando` : 'Carregando'} /> : startIcon} // Adicionado aria-label
      endIcon={!loading && endIcon} // Only show endIcon if not loading
      primary={primary} // Pass primary prop to styled component
      aria-label={label} // Adicionado aria-label para o botão
      {...props}
    >
      {!loading && label}
      {loading && <span className="sr-only">{label ? `${label} carregando` : 'Carregando'}</span>} {/* Adicionado texto visível para leitores de tela quando carregando */}
    </StyledMuiButton>
  );
};
