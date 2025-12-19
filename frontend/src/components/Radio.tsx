import React from 'react';
import { motion } from 'framer-motion';
import {
  RadioContainer,
  HiddenRadio,
  StyledRadio,
  RadioDot,
  RadioLabel,
  RadioErrorMessage,
} from './Radio.styled';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  id?: string;
  name: string; // Name é obrigatório para grupos de rádio
}

const Radio: React.FC<RadioProps> = ({ label, checked, onChange, error, id, name, disabled, ...props }) => {
  const inputId = id || React.useId();

  const dotVariants = {
    checked: { scale: 1, opacity: 1 },
    unchecked: { scale: 0, opacity: 0 },
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    onChange(event);
  };

  return (
    <RadioContainer>
      <HiddenRadio
        id={inputId}
        type="radio"
        name={name}
        checked={checked}
        onChange={handleChange} // Use the new handleChange
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        disabled={disabled} // Pass disabled explicitly
        {...props}
      />
      <StyledRadio checked={checked} error={!!error}>
        <RadioDot
          as={motion.div}
          variants={dotVariants}
          initial={checked ? 'checked' : 'unchecked'}
          animate={checked ? 'checked' : 'unchecked'}
          transition={{ duration: 0.2 }}
        />
      </StyledRadio>
      {label && <RadioLabel htmlFor={inputId}>{label}</RadioLabel>}
      {error && <RadioErrorMessage id={`${inputId}-error`}>{error}</RadioErrorMessage>}
    </RadioContainer>
  );
};

export default Radio;
