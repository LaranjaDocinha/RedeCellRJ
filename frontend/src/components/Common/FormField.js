import React from 'react';
import { Label, Input, FormFeedback, FormGroup } from 'reactstrap';

const iconMap = {
  email: 'bx-user',
  password: 'bx-lock-alt',
  // Adicione outros mapeamentos de ícones aqui
};

const FormField = ({ name, label, type = 'text', placeholder, formik }) => {
  const hasError = !!(formik.touched[name] && formik.errors[name]);
  const isValid = formik.touched[name] && !formik.errors[name];
  const icon = iconMap[name] || 'bx-info-circle';

  return (
    <FormGroup className='mb-3'>
      <Label className='form-label' htmlFor={name}>
        {label}
      </Label>
      <div className={`input-group ${hasError ? 'has-error' : isValid ? 'has-success' : ''}`}>
        <span className='input-group-text'>
          <i className={`bx ${icon}`}></i>
        </span>
        <Input
          aria-describedby={hasError ? `${name}-feedback` : undefined}
          aria-invalid={hasError ? 'true' : 'false'}
          className={hasError ? 'is-invalid' : isValid ? 'is-valid' : ''}
          id={name}
          name={name}
          placeholder={placeholder}
          type={type}
          value={formik.values[name]}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
        />
      </div>
      {hasError && (
        <FormFeedback className='d-block' id={`${name}-feedback`} type='invalid'>
          {formik.errors[name]}
        </FormFeedback>
      )}
    </FormGroup>
  );
};

export default FormField;
