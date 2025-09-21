import React from 'react';
import { InputContainer, InputLabel, StyledInput, InputErrorMessage } from './Input.styled';
import { motion } from 'framer-motion'; // Import motion

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <InputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledInput as={motion.input} $hasError={!!error} whileFocus={{ scale: 1.02 }} {...props} />
      {error && <InputErrorMessage>{error}</InputErrorMessage>}
    </InputContainer>
  );
};

export default Input;
