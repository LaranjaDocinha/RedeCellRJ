import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';
import ColorPickerComponent from './ColorPickerComponent';

const GradientSettings = ({
  gradientColor1,
  gradientColor2,
  gradientColor3,
  gradientColor4,
  gradientSpeed,
  gradientDirection,
  onColorChange,
  onSpeedChange,
  onDirectionChange,
}) => {
  return (
    <div>
      <h5 className="mb-3">Configurações do Gradiente</h5>
      <Row className="mb-3">
        <Col md={6}>
          <FormGroup>
            <Label for="gradientColor1">Cor 1</Label>
            <ColorPickerComponent
              color={gradientColor1}
              onChange={(color) => onColorChange('gradientColor1', color.rgb)}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="gradientColor2">Cor 2</Label>
            <ColorPickerComponent
              color={gradientColor2}
              onChange={(color) => onColorChange('gradientColor2', color.rgb)}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <FormGroup>
            <Label for="gradientColor3">Cor 3</Label>
            <ColorPickerComponent
              color={gradientColor3}
              onChange={(color) => onColorChange('gradientColor3', color.rgb)}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="gradientColor4">Cor 4</Label>
            <ColorPickerComponent
              color={gradientColor4}
              onChange={(color) => onColorChange('gradientColor4', color.rgb)}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <FormGroup>
            <Label for="gradientSpeed">Velocidade (segundos)</Label>
            <Input
              type="number"
              id="gradientSpeed"
              value={gradientSpeed}
              onChange={(e) => onSpeedChange(e.target.value)}
              min="1"
              max="60"
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="gradientDirection">Direção (graus)</Label>
            <Input
              type="number"
              id="gradientDirection"
              value={gradientDirection}
              onChange={(e) => onDirectionChange(e.target.value)}
              min="0"
              max="360"
            />
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

GradientSettings.propTypes = {
  gradientColor1: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  gradientColor2: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  gradientColor3: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  gradientColor4: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  gradientSpeed: PropTypes.number.isRequired,
  gradientDirection: PropTypes.number.isRequired,
  onColorChange: PropTypes.func.isRequired,
  onSpeedChange: PropTypes.func.isRequired,
  onDirectionChange: PropTypes.func.isRequired,
};

export default GradientSettings;
