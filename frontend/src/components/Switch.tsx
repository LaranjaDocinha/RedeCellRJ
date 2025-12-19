import React from 'react';
import { motion } from 'framer-motion';
import {
  SwitchContainer,
  HiddenCheckbox,
  StyledSwitch,
  SwitchThumb,
  SwitchLabel,
  SwitchErrorMessage,
} from './Switch.styled';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({ label, checked, onChange, error, id, disabled, ...props }) => {
  const inputId = id || React.useId();

  const thumbVariants = {
    checked: { x: 18 }, // Mover para a direita
    unchecked: { x: 0 }, // Posição inicial
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    onChange(event);
  };

  return (
    <SwitchContainer>
      <HiddenCheckbox
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={handleChange} // Use the new handleChange
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        disabled={disabled} // Pass disabled explicitly
        {...props}
      />
      <StyledSwitch checked={checked} error={!!error}>
        <SwitchThumb
          as={motion.div}
          variants={thumbVariants}
          initial={checked ? 'checked' : 'unchecked'}
          animate={checked ? 'checked' : 'unchecked'}
          transition={{ duration: 0.2 }}
        />
      </StyledSwitch>
      {label && <SwitchLabel htmlFor={inputId}>{label}</SwitchLabel>}
      {error && <SwitchErrorMessage id={`${inputId}-error`}>{error}</SwitchErrorMessage>}
    </SwitchContainer>
  );
};

export default Switch;
