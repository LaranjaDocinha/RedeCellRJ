import React, { useState } from 'react';
import { Label, Input, FormFeedback, FormGroup, InputGroup } from 'reactstrap';

const PasswordField = ({ name, label, placeholder, formik }) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!(formik.touched[name] && formik.errors[name]);

  return (
    <FormGroup className="mb-3">
      <Label className="form-label" htmlFor={name}>{label}</Label>
      <InputGroup>
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          invalid={hasError}
        />
        <button
          className="btn btn-light"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
          <i className={showPassword ? "mdi mdi-eye-off" : "mdi mdi-eye"}></i>
        </button>
      </InputGroup>
      {hasError && <FormFeedback type="invalid" style={{ display: 'block' }}>{formik.errors[name]}</FormFeedback>}
    </FormGroup>
  );
};

export default PasswordField;