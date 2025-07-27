import React, { useState } from 'react';
import { Label, Input, FormFeedback, FormGroup, InputGroup, Tooltip } from 'reactstrap';
import { motion } from "framer-motion";
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
      case 0: return '';
      case 1: return 'bg-danger';
      case 2: return 'bg-warning';
      case 3: return 'bg-info';
      case 4: return 'bg-success';
      case 5: return 'bg-success fw-bold';
      default: return '';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0: return '';
      case 1: return 'Muito Fraca';
      case 2: return 'Fraca';
      case 3: return 'Boa';
      case 4: return 'Forte';
      case 5: return 'Muito Forte';
      default: return '';
    }
  };

  return (
    <FormGroup className="mb-3">
      <Label className="form-label" htmlFor={name}>{label}</Label>
      <InputGroup className={`${hasError ? 'has-error' : isValid ? 'has-success' : ''}`}>
        <span className="input-group-text"><i className="bx bx-lock"></i></span>
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          onChange={handlePasswordChange}
          onBlur={(e) => {
            formik.handleBlur(e);
            setTooltipOpen(false);
          }}
          onFocus={() => setTooltipOpen(true)}
          value={formik.values[name]}
          className={hasError ? 'is-invalid' : isValid ? 'is-valid' : ''}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${name}-feedback` : undefined}
        />
        <PasswordToggle showPassword={showPassword} togglePasswordVisibility={() => setShowPassword(!showPassword)} />
        
        {isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="validation-icon"
          >
            <i className="bx bx-check-circle text-success"></i>
          </motion.div>
        )}
        
        <Tooltip
          placement="right"
          isOpen={tooltipOpen}
          target={name}
          toggle={() => setTooltipOpen(!tooltipOpen)}
          transition={{ timeout: 300 }}
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
        <div className="progress mt-1" style={{ height: '5px' }}>
          <div
            className={`progress-bar ${getStrengthClassName()}`}
            role="progressbar"
            style={{ width: `${passwordStrength * 20}%` }}
            aria-valuenow={passwordStrength * 20}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}
      {formik.values[name] && <small className="text-muted">{getStrengthText()}</small>}
      {hasError && <FormFeedback type="invalid" style={{ display: 'block' }} id={`${name}-feedback`}>{formik.errors[name]}</FormFeedback>}
    </FormGroup>
  );
};

export default PasswordField;