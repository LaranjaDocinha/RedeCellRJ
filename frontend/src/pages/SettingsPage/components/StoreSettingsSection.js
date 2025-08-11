import React from 'react';
import { FormGroup, Label, Input, Row, Col } from 'reactstrap';

const timezones = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'Nova York (GMT-4)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
  { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)' },
];

const currencies = [
  { value: 'BRL', label: 'Real Brasileiro (BRL)' },
  { value: 'USD', label: 'Dólar Americano (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

const StoreSettingsSection = ({ settings, handleInputChange }) => {
  return (
    <>
      <h5 className='mb-4'>Informações da Loja</h5>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for='store_name'>Nome da Loja</Label>
            <Input
              id='store_name'
              name='store_name'
              type='text'
              value={settings.store_name || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for='store_address'>Endereço</Label>
            <Input
              id='store_address'
              name='store_address'
              type='text'
              value={settings.store_address || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for='store_phone'>Telefone</Label>
            <Input
              id='store_phone'
              name='store_phone'
              type='text'
              value={settings.store_phone || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for='timezone'>Fuso Horário Padrão</Label>
            <Input
              id='timezone'
              name='timezone'
              type='select'
              value={settings.timezone || 'America/Sao_Paulo'}
              onChange={handleInputChange}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for='currency'>Moeda Padrão</Label>
            <Input
              id='currency'
              name='currency'
              type='select'
              value={settings.currency || 'BRL'}
              onChange={handleInputChange}
            >
              {currencies.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <h5 className='mt-5 mb-4'>Logo e Favicon</h5>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for='store_logo_url'>URL da Logo</Label>
            <Input
              id='store_logo_url'
              name='store_logo_url'
              type='text'
              placeholder='URL da logo da loja'
              value={settings.store_logo_url || ''}
              onChange={handleInputChange}
            />
            {settings.store_logo_url && (
              <div className='mt-3 text-center'>
                <img
                  alt='Pré-visualização da Logo'
                  className='img-thumbnail'
                  src={settings.store_logo_url}
                  style={{ maxWidth: '150px', maxHeight: '150px' }}
                />
              </div>
            )}
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for='favicon_url'>URL do Favicon</Label>
            <Input
              id='favicon_url'
              name='favicon_url'
              type='text'
              placeholder='URL do favicon'
              value={settings.favicon_url || ''}
              onChange={handleInputChange}
            />
            {settings.favicon_url && (
              <div className='mt-3 text-center'>
                <img
                  alt='Pré-visualização do Favicon'
                  className='img-thumbnail'
                  src={settings.favicon_url}
                  style={{ maxWidth: '50px', maxHeight: '50px' }}
                />
              </div>
            )}
          </FormGroup>
        </Col>
      </Row>
    </>
  );
};

export default StoreSettingsSection;
