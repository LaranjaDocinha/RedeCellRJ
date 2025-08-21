
import React from 'react';
import { CustomInput, FormGroup, Label } from 'reactstrap';
import PropTypes from 'prop-types';

const ToggleSwitch = ({ id, name, label, checked, onChange, ...rest }) => {
  return (
    <FormGroup>
      <Label for={id || name}>{label}</Label>
      <div>
        <CustomInput
          type="switch"
          id={id || name}
          name={name}
          checked={checked}
          onChange={onChange}
          {...rest}
        />
      </div>
    </FormGroup>
  );
};

ToggleSwitch.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ToggleSwitch;
