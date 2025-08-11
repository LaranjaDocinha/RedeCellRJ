import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label } from 'reactstrap';
import ColorPickerComponent from './ColorPickerComponent';

const SolidColorSettings = ({ solidColor, onColorChange }) => {
  return (
    <div>
      <h5 className="mb-3">Configurações de Cor Sólida</h5>
      <FormGroup>
        <Label for="solidColor">Cor Sólida</Label>
        <ColorPickerComponent
          color={solidColor}
          onChange={(color) => onColorChange(color.rgb)}
        />
      </FormGroup>
    </div>
  );
};

SolidColorSettings.propTypes = {
  solidColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  onColorChange: PropTypes.func.isRequired,
};

export default SolidColorSettings;
