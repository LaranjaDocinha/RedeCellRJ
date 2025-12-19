import React, { useState } from 'react';
import {
  InputContainer,
  InputLabel,
  StyledInput,
  InputErrorMessage,
  InputWrapper,
  InputHelperText,
} from './Input.styled';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  id?: string;
  startAdornmentAriaLabel?: string;
  endAdornmentAriaLabel?: string;
  status?: 'success' | 'error' | 'none';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  size = 'medium',
  startAdornment,
  endAdornment,
  helperText,
  id,
  value,
  startAdornmentAriaLabel,
  endAdornmentAriaLabel,
  type,
  status = 'none',
  ...props
}, ref) => {
  const { disabled, readOnly, ...restProps } = props;
  const inputId = id || React.useId();

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = value !== undefined && value !== null && value !== '';
  const shouldLabelFloat = isFocused || hasValue;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const actualInputType = type === 'password' && showPassword ? 'text' : type;

  let currentEndAdornment = endAdornment;
  if (type === 'password') {
    currentEndAdornment = (
      <span
        className="input-adornment end-adornment password-toggle"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        role="button"
        tabIndex={0}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    );
  } else if (status === 'success') {
    currentEndAdornment = (
      <span className="input-adornment end-adornment success-icon">
        <FaCheckCircle color="green" />
      </span>
    );
  } else if (status === 'error' && !error) {
    currentEndAdornment = (
      <span className="input-adornment end-adornment error-icon">
        <FaTimesCircle color="red" />
      </span>
    );
  }

  return (
    <InputContainer>
      <InputWrapper
        $isErrored={!!error}
        disabled={disabled}
        readOnly={readOnly}
        $isFocused={isFocused}
      >
        {label && (
          <InputLabel htmlFor={inputId} $shouldFloat={shouldLabelFloat}>
            {label}
          </InputLabel>
        )}
        {startAdornment && (
          <span
            className="input-adornment start-adornment"
            aria-hidden={startAdornmentAriaLabel ? undefined : 'true'}
            aria-label={startAdornmentAriaLabel}
          >
            {startAdornment}
          </span>
        )}
        <StyledInput
          id={inputId}
          ref={ref}
          $hasError={!!error}
          size={size}
          whileFocus={{ scale: 1.02 }}
          disabled={disabled}
          readOnly={readOnly}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          type={actualInputType}
          {...restProps}
        />
        {currentEndAdornment && (
          <span
            className="input-adornment end-adornment"
            aria-hidden={endAdornmentAriaLabel ? undefined : 'true'}
            aria-label={endAdornmentAriaLabel}
          >
            {currentEndAdornment}
          </span>
        )}
      </InputWrapper>
      {!error && helperText && (
        <InputHelperText id={`${inputId}-helper`}>{helperText}</InputHelperText>
      )}
      {error && <InputErrorMessage id={`${inputId}-error`}>{error}</InputErrorMessage>}
    </InputContainer>
  );
});

export default Input;
