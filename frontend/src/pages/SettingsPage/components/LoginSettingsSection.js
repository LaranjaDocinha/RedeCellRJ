import React from 'react';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';

const LoginSettingsSection = ({ settings, handleInputChange }) => {
  return (
    <>
      <h4 className='h4 mb-4'>Configurações da Tela de Login</h4>

      <FormGroup className='mb-3'>
        <Label for='background_type'>Tipo de Fundo</Label>
        <Input
          id='background_type'
          name='background_type'
          type='select'
          value={settings.background_type || 'solid'}
          onChange={handleInputChange}
        >
          <option value='solid'>Cor Sólida</option>
          <option value='image'>Imagem</option>
          <option value='video'>Vídeo</option>
          <option value='gradient'>Gradiente</option>
        </Input>
      </FormGroup>

      {settings.background_type === 'solid' && (
        <Row>
          <Col md={6}>
            <FormGroup className='mb-3'>
              <Label for='background_solid_color'>Cor Sólida</Label>
              <Input
                className='form-control-color'
                id='background_solid_color'
                name='background_solid_color'
                type='color'
                value={settings.background_solid_color || '#007bff'}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Col>
        </Row>
      )}

      {settings.background_type === 'image' && (
        <Row>
          <Col md={6}>
            <FormGroup className='mb-3'>
              <Label for='background_image_url'>URL da Imagem</Label>
              <Input
                id='background_image_url'
                name='background_image_url'
                type='text'
                placeholder='Ex: https://example.com/background.jpg'
                value={settings.background_image_url || ''}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup className='mb-3'>
              <Label for='image_size'>Tamanho da Imagem</Label>
              <Input
                id='image_size'
                name='image_size'
                type='select'
                value={settings.image_size || 'cover'}
                onChange={handleInputChange}
              >
                <option value='auto'>Auto</option>
                <option value='cover'>Cobrir</option>
                <option value='contain'>Conter</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup className='mb-3'>
              <Label for='image_repeat'>Repetição da Imagem</Label>
              <Input
                id='image_repeat'
                name='image_repeat'
                type='select'
                value={settings.image_repeat || 'no-repeat'}
                onChange={handleInputChange}
              >
                <option value='no-repeat'>Não Repetir</option>
                <option value='repeat'>Repetir</option>
                <option value='repeat-x'>Repetir X</option>
                <option value='repeat-y'>Repetir Y</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
      )}

      {settings.background_type === 'video' && (
        <Row>
          <Col md={6}>
            <FormGroup className='mb-3'>
              <Label for='background_video_url'>URL do Vídeo</Label>
              <Input
                id='background_video_url'
                name='background_video_url'
                type='text'
                placeholder='Ex: https://example.com/background.mp4'
                value={settings.background_video_url || ''}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Col>
        </Row>
      )}

      {settings.background_type === 'gradient' && (
        <>
          <Row>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label for='gradient_color_1'>Cor do Gradiente 1</Label>
                <Input
                  className='form-control-color'
                  id='gradient_color_1'
                  name='gradient_color_1'
                  type='color'
                  value={settings.gradient_color_1 || '#007bff'}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label for='gradient_color_2'>Cor do Gradiente 2</Label>
                <Input
                  className='form-control-color'
                  id='gradient_color_2'
                  name='gradient_color_2'
                  type='color'
                  value={settings.gradient_color_2 || '#28a745'}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label for='gradient_color_3'>Cor do Gradiente 3</Label>
                <Input
                  className='form-control-color'
                  id='gradient_color_3'
                  name='gradient_color_3'
                  type='color'
                  value={settings.gradient_color_3 || '#ffc107'}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label for='gradient_color_4'>Cor do Gradiente 4</Label>
                <Input
                  className='form-control-color'
                  id='gradient_color_4'
                  name='gradient_color_4'
                  type='color'
                  value={settings.gradient_color_4 || '#dc3545'}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label for='gradient_speed'>Velocidade do Gradiente</Label>
                <Input
                  id='gradient_speed'
                  name='gradient_speed'
                  type='number'
                  placeholder='Ex: 10 (em segundos)'
                  value={settings.gradient_speed || 10}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className='mb-3'>
                <Label for='gradient_direction'>Direção do Gradiente</Label>
                <Input
                  id='gradient_direction'
                  name='gradient_direction'
                  type='text'
                  placeholder='Ex: to right, 45deg'
                  value={settings.gradient_direction || 'to right'}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default LoginSettingsSection;
