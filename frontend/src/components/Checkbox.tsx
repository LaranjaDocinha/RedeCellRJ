import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckboxContainer,
  HiddenCheckbox,
  StyledCheckbox,
  CheckmarkIcon,
  CheckboxLabel,
  CheckboxErrorMessage,
} from './Checkbox.styled';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, error, id, disabled, ...props }) => {
  const inputId = id || React.useId();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    onChange(event);
  };

  const checkmarkVariants = {
    checked: { pathLength: 1, opacity: 1 },
    unchecked: { pathLength: 0, opacity: 0 },
  };

  return (
    <CheckboxContainer>
      <label htmlFor={inputId}>
        <HiddenCheckbox
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          disabled={disabled}
          {...props}
        />
        <StyledCheckbox checked={checked} error={!!error} disabled={disabled}>
          <CheckmarkIcon
            as={motion.svg}
            viewBox="0 0 24 24"
            variants={checkmarkVariants}
            initial={checked ? 'checked' : 'unchecked'}
            animate={checked ? 'checked' : 'unchecked'}
            transition={{ duration: 0.2 }}
          >
            <path d="M4.1 12.7L9.3 17.9L20.3 6.9" fill="none" strokeWidth="2" stroke="#FFF" />
          </CheckmarkIcon>
        </StyledCheckbox>
        {label && <CheckboxLabel>{label}</CheckboxLabel>}
      </label>
      {error && <CheckboxErrorMessage id={`${inputId}-error`}>{error}</CheckboxErrorMessage>}
    </CheckboxContainer>
  );
};

export default Checkbox;
