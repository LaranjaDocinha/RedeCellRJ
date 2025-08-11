import React from 'react';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';

const paperSizes = [
  { value: 'A4', label: 'A4 (210 x 297 mm)' },
  { value: 'Letter', label: 'Carta (8.5 x 11 in)' },
  { value: 'Legal', label: 'Ofício (8.5 x 14 in)' },
  { value: 'Roll80mm', label: 'Bobina 80mm' },
  { value: 'Roll58mm', label: 'Bobina 58mm' },
];

const PrintSettingsSection = ({ settings, handleInputChange }) => {
  return (
    <>
      <h4 className='h4 mb-4'>Configurações de Impressão</h4>

      <h5 className='mb-3'>Cabeçalho e Rodapé</h5>
      <FormGroup className='mb-3'>
        <Label for='print_header_text'>Texto do Cabeçalho</Label>
        <Input
          id='print_header_text'
          name='print_header_text'
          type='textarea'
          rows='3'
          value={settings.print_header_text || ''}
          onChange={handleInputChange}
          placeholder='Digite o texto do cabeçalho para documentos impressos...'
        />
      </FormGroup>
      <FormGroup className='mb-3'>
        <Label for='print_footer_text'>Texto do Rodapé</Label>
        <Input
          id='print_footer_text'
          name='print_footer_text'
          type='textarea'
          rows='3'
          value={settings.print_footer_text || ''}
          onChange={handleInputChange}
          placeholder='Digite o texto do rodapé para documentos impressos...'
        />
      </FormGroup>

      <h5 className='mt-4 mb-3'>Margens (mm) e Tamanho do Papel</h5>
      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='print_margin_top'>Margem Superior</Label>
            <Input
              id='print_margin_top'
              name='print_margin_top'
              type='number'
              value={settings.print_margin_top || 0}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='print_margin_bottom'>Margem Inferior</Label>
            <Input
              id='print_margin_bottom'
              name='print_margin_bottom'
              type='number'
              value={settings.print_margin_bottom || 0}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='print_margin_left'>Margem Esquerda</Label>
            <Input
              id='print_margin_left'
              name='print_margin_left'
              type='number'
              value={settings.print_margin_left || 0}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='print_margin_right'>Margem Direita</Label>
            <Input
              id='print_margin_right'
              name='print_margin_right'
              type='number'
              value={settings.print_margin_right || 0}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <FormGroup className='mb-3'>
        <Label for='print_paper_size'>Tamanho do Papel</Label>
        <Input
          id='print_paper_size'
          name='print_paper_size'
          type='select'
          value={settings.print_paper_size || 'A4'}
          onChange={handleInputChange}
        >
          {paperSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </Input>
      </FormGroup>
    </>
  );
};

export default PrintSettingsSection;
