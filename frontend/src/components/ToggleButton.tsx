import React from 'react';
import { motion } from 'framer-motion';
import { StyledToggleButton } from './ToggleButton.styled';

interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  label?: string;
  icon?: React.ReactNode;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  value,
  selected,
  onChange,
  label,
  icon,
  disabled,
  ...props
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <StyledToggleButton
      type="button"
      selected={selected}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      {...props}
    >
      {icon && <span className="toggle-button-icon">{icon}</span>}
      {label && <span className="toggle-button-label">{label}</span>}
    </StyledToggleButton>
  );
};

export default ToggleButton;
