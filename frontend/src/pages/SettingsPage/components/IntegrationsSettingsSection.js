import React from 'react';
import { FormGroup, Label, Input, Alert, Row, Col } from 'reactstrap';

const IntegrationsSettingsSection = ({ settings, handleInputChange }) => {
  return (
    <>
      <h4 className='h4 mb-4'>Configurações de Integrações</h4>

      <h5>Serviço de E-mail (Ex: SendGrid)</h5>
      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='email_api_key'>Chave de API do Serviço de E-mail</Label>
            <Input
              id='email_api_key'
              name='email_api_key'
              type='text'
              placeholder='Sua chave de API do SendGrid ou similar'
              value={settings.email_api_key || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='default_sender_email'>E-mail Remetente Padrão</Label>
            <Input
              id='default_sender_email'
              name='default_sender_email'
              type='email'
              placeholder='seuemail@exemplo.com'
              value={settings.default_sender_email || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <hr className='my-4' />

      <h5>Serviço de SMS (Ex: Twilio)</h5>
      <Row>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='sms_account_sid'>Account SID (Twilio)</Label>
            <Input
              id='sms_account_sid'
              name='sms_account_sid'
              type='text'
              placeholder='ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
              value={settings.sms_account_sid || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='sms_auth_token'>Auth Token (Twilio)</Label>
            <Input
              id='sms_auth_token'
              name='sms_auth_token'
              type='text'
              placeholder='Seu Auth Token'
              value={settings.sms_auth_token || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup className='mb-3'>
            <Label for='sms_phone_number'>Número de Telefone (Twilio)</Label>
            <Input
              id='sms_phone_number'
              name='sms_phone_number'
              type='text'
              placeholder='+1234567890'
              value={settings.sms_phone_number || ''}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <hr className='my-4' />

      <h5>Webhooks</h5>
      <p>Configure webhooks para notificações e comunicação com sistemas externos.</p>
      {/* Placeholder for Webhook Management UI */}
      <Alert color='secondary'>
        Interface para Gerenciamento de Webhooks (a ser implementado)
      </Alert>

      <hr className='my-4' />

      <h5>Outras Integrações</h5>
      <Alert color='info'>
        Outras integrações (CRM, ERP, E-commerce) podem ser configuradas aqui no futuro.
      </Alert>
    </>
  );
};

export default IntegrationsSettingsSection;
