import React, { useState } from 'react';
import { Label, Input, FormFeedback, FormGroup, InputGroup, Tooltip } from 'reactstrap';

import PasswordToggle from './PasswordToggle';

const PasswordField = ({ name, label, placeholder, formik }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4 for strength
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const hasError = !!(formik.touched[name] && formik.errors[name]);
  const isValid = formik.touched[name] && !formik.errors[name];

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    formik.handleChange(e);
    setPasswordStrength(getPasswordStrength(e.target.value));
  };

  const getStrengthClassName = () => {
    switch (passwordStrength) {
      case 0:
        return '';
      case 1:
        return 'bg-danger';
      case 2:
        return 'bg-warning';
      case 3:
        return 'bg-info';
      case 4:
        return 'bg-success';
      case 5:
        return 'bg-success fw-bold';
      default:
        return '';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return '';
      case 1:
        return 'Muito Fraca';
      case 2:
        return 'Fraca';
      case 3:
        return 'Boa';
      case 4:
        return 'Forte';
      case 5:
        return 'Muito Forte';
      default:
        return '';
    }
  };

  return (
    <FormGroup className='mb-3'>
      <Label className='form-label' htmlFor={name}>
        {label}
      </Label>
      <InputGroup className={`${hasError ? 'has-error' : isValid ? 'has-success' : ''}`}>
        <span className='input-group-text'>
          <i className='bx bx-lock'></i>
        </span>
        <Input
          aria-describedby={hasError ? `${name}-feedback` : undefined}
          aria-invalid={hasError ? 'true' : 'false'}
          className={hasError ? 'is-invalid' : isValid ? 'is-valid' : ''}
          id={name}
          name={name}
          placeholder={placeholder}
          type={showPassword ? 'text' : 'password'}
          value={formik.values[name]}
          onBlur={(e) => {
            formik.handleBlur(e);
            setTooltipOpen(false);
          }}
          onChange={handlePasswordChange}
          onFocus={() => setTooltipOpen(true)}
        />
        <PasswordToggle
          showPassword={showPassword}
          togglePasswordVisibility={() => setShowPassword(!showPassword)}
        />

        <Tooltip
          
          isOpen={tooltipOpen}
          placement='right'
          target={name}
          
          toggle={() => setTooltipOpen(!tooltipOpen)}
        >
          A senha deve conter:
          <ul>
            <li>Mínimo de 8 caracteres</li>
            <li>Pelo menos uma letra minúscula</li>
            <li>Pelo menos uma letra maiúscula</li>
            <li>Pelo menos um número</li>
            <li>Pelo menos um caractere especial</li>
          </ul>
        </Tooltip>
      </InputGroup>
      {formik.values[name] && (
        <div className='progress mt-3 password-strength-bar' style={{ height: '5px' }}>
          <div
            aria-valuemax='100'
            aria-valuemin='0'
            aria-valuenow={passwordStrength * 20}
            className={`progress-bar ${getStrengthClassName()}`}
            role='progressbar'
            style={{ width: `${passwordStrength * 20}%` }}
          ></div>
        </div>
      )}
      {formik.values[name] && <small className='text-muted'>{getStrengthText()}</small>}
      {hasError && (
        <FormFeedback id={`${name}-feedback`} style={{ display: 'block' }} type='invalid'>
          {formik.errors[name]}
        </FormFeedback>
      )}
    </FormGroup>
  );
};

export default PasswordField;
