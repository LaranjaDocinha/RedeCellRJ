import React from 'react';
import { Card, CardBody, CardTitle, FormGroup, Label, Input } from 'reactstrap';

const NotificationSettingsSection = ({ settings, handleInputChange }) => {
  return (
    <Card>
      <CardBody>
        <CardTitle className='h4 mb-4'>Configurações de Notificação</CardTitle>
        <p className='text-muted mb-4'>Gerencie suas preferências de notificação.</p>

        <FormGroup>
          <Label for='emailNotifications'>Notificações por E-mail</Label>
          <div className='form-check form-switch form-switch-lg mb-3'> {/* Use form-switch for toggle */} 
            <Input
              type='checkbox'
              className='form-check-input'
              id='emailNotifications'
              name='email_notifications_enabled'
              checked={settings.email_notifications_enabled || false}
              onChange={handleInputChange}
            />
            <Label className='form-check-label' htmlFor='emailNotifications'>Receber notificações por e-mail</Label>
          </div>
        </FormGroup>

        <FormGroup>
          <Label for='smsNotifications'>Notificações por SMS</Label>
          <div className='form-check form-switch form-switch-lg mb-3'> {/* Use form-switch for toggle */} 
            <Input
              type='checkbox'
              className='form-check-input'
              id='smsNotifications'
              name='sms_notifications_enabled'
              checked={settings.sms_notifications_enabled || false}
              onChange={handleInputChange}
            />
            <Label className='form-check-label' htmlFor='smsNotifications'>Receber notificações por SMS</Label>
          </div>
        </FormGroup>

        <FormGroup>
          <Label for='inAppNotifications'>Notificações no Aplicativo</Label>
          <div className='form-check form-switch form-switch-lg mb-3'> {/* Use form-switch for toggle */} 
            <Input
              type='checkbox'
              className='form-check-input'
              id='inAppNotifications'
              name='in_app_notifications_enabled'
              checked={settings.in_app_notifications_enabled || false}
              onChange={handleInputChange}
            />
            <Label className='form-check-label' htmlFor='inAppNotifications'>Receber notificações dentro do aplicativo</Label>
          </div>
        </FormGroup>

        {/* Add more notification settings as needed */}

      </CardBody>
    </Card>
  );
};

export default NotificationSettingsSection;
