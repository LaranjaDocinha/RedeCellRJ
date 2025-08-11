import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

const BackgroundTypeSelector = ({ selectedType, onChange }) => {
  const types = [
    { value: 'gradient', label: 'Gradiente Dinâmico' },
    { value: 'solid', label: 'Cor Sólida' },
    { value: 'image', label: 'Imagem' },
    { value: 'video', label: 'Vídeo/GIF' },
  ];

  return (
    <FormGroup tag="fieldset">
      <legend className="col-form-label pt-0">Tipo de Fundo</legend>
      {types.map((type) => (
        <FormGroup check key={type.value}>
          <Input
            type="radio"
            name="backgroundType"
            id={`backgroundType-${type.value}`}
            value={type.value}
            checked={selectedType === type.value}
            onChange={(e) => onChange(e.target.value)}
          />
          {' '}
          <Label check for={`backgroundType-${type.value}`}>
            {type.label}
          </Label>
        </FormGroup>
      ))}
    </FormGroup>
  );
};

BackgroundTypeSelector.propTypes = {
  selectedType: PropTypes.oneOf(['gradient', 'solid', 'image', 'video']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default BackgroundTypeSelector;
