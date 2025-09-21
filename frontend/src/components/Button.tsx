import React from 'react';
import { StyledButton } from './Button.styled';
import useHapticFeedback from '../hooks/useHapticFeedback'; // Import useHapticFeedback

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant to use.
   * @default 'contained'
   */
  variant?: 'contained' | 'outlined' | 'text';
  /**
   * The color of the button.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'danger';
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  label,
  onClick, // Destructure onClick
  ...props
}) => {
  const triggerHapticFeedback = useHapticFeedback(); // Use the hook

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerHapticFeedback(); // Trigger haptic feedback on click
    onClick?.(event); // Call original onClick if it exists
  };

  return (
    <StyledButton
      type="button"
      variant={variant}
      color={color}
      size={size}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick} // Use the new handleClick
      {...props}
    >
      {label}
    </StyledButton>
  );
};

export default Button;