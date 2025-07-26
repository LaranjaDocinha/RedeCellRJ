import React from "react";
import { Label, Input, FormFeedback, FormGroup } from "reactstrap";

const FormField = ({ name, label, type = "text", placeholder, formik }) => {
  const hasError = !!(formik.touched[name] && formik.errors[name]);

  return (
    <FormGroup className="mb-3">
      <Label className="form-label" htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
        invalid={hasError}
      />
      {hasError && (
        <FormFeedback type="invalid">{formik.errors[name]}</FormFeedback>
      )}
    </FormGroup>
  );
};

export default FormField;