import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';

const ImageSettings = ({
  imageUrl,
  imageSize,
  imageRepeat,
  onImageUrlChange,
  onImageSizeChange,
  onImageRepeatChange,
}) => {
  return (
    <div>
      <h5 className="mb-3">Configurações de Imagem</h5>
      <FormGroup className="mb-3">
        <Label for="imageUrl">URL da Imagem</Label>
        <Input
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="Ex: https://example.com/background.jpg"
        />
      </FormGroup>
      <Row className="mb-3">
        <Col md={6}>
          <FormGroup>
            <Label for="imageSize">Tamanho da Imagem</Label>
            <Input
              type="select"
              id="imageSize"
              value={imageSize}
              onChange={(e) => onImageSizeChange(e.target.value)}
            >
              <option value="cover">Cobrir (cover)</option>
              <option value="contain">Conter (contain)</option>
              <option value="auto">Automático (auto)</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="imageRepeat">Repetição da Imagem</Label>
            <Input
              type="select"
              id="imageRepeat"
              value={imageRepeat}
              onChange={(e) => onImageRepeatChange(e.target.value)}
            >
              <option value="no-repeat">Não Repetir</option>
              <option value="repeat">Repetir</option>
              <option value="repeat-x">Repetir Horizontalmente</option>
              <option value="repeat-y">Repetir Verticalmente</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

ImageSettings.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  imageSize: PropTypes.oneOf(['cover', 'contain', 'auto']).isRequired,
  imageRepeat: PropTypes.oneOf(['no-repeat', 'repeat', 'repeat-x', 'repeat-y']).isRequired,
  onImageUrlChange: PropTypes.func.isRequired,
  onImageSizeChange: PropTypes.func.isRequired,
  onImageRepeatChange: PropTypes.func.isRequired,
};

export default ImageSettings;
