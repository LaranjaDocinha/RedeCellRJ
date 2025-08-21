import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, FormGroup, Label, Input, Button } from 'reactstrap';
import { get, put } from '../../../helpers/api_helper'; // Ajuste o caminho conforme necessário
import useNotification from '../../../hooks/useNotification'; // Ajuste o caminho conforme necessário

const WhatsAppIntegration = () => {
  document.title = 'Configurações do WhatsApp | PDV Web';

  const { showSuccess, showError } = useNotification();
  const [whatsappSettings, setWhatsappSettings] = useState({
    enabled: false,
    phoneNumber: '',
    instanceId: '',
    token: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await get('/api/settings');
        if (response.apps_settings && response.apps_settings.whatsapp) {
          setWhatsappSettings(response.apps_settings.whatsapp);
        }
      } catch (err) {
        console.error('Erro ao buscar configurações do WhatsApp:', err);
        showError('Não foi possível carregar as configurações do WhatsApp.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWhatsappSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      await put('/api/settings/apps_settings.whatsapp', { value: whatsappSettings });
      showSuccess('Configurações do WhatsApp salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações do WhatsApp:', err);
      showError('Erro ao salvar configurações do WhatsApp.');
    }
  };

  if (loading) {
    return (
      <div className='page-content'>
        <Container fluid>
          <p>Carregando configurações do WhatsApp...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className='page-content'>
      <Container fluid>
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle className='mb-4'>Configurações do WhatsApp</CardTitle>
                <FormGroup check className="mb-3">
                  <Input
                    type="checkbox"
                    name="enabled"
                    id="whatsappEnabled"
                    checked={whatsappSettings.enabled}
                    onChange={handleInputChange}
                  />
                  <Label for="whatsappEnabled" check>Habilitar Integração com WhatsApp</Label>
                </FormGroup>
                <FormGroup>
                  <Label for="phoneNumber">Número de Telefone</Label>
                  <Input
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={whatsappSettings.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Ex: +5511999999999"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="instanceId">ID da Instância</Label>
                  <Input
                    type="text"
                    name="instanceId"
                    id="instanceId"
                    value={whatsappSettings.instanceId}
                    onChange={handleInputChange}
                    placeholder="ID da instância da API do WhatsApp"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="token">Token de Acesso</Label>
                  <Input
                    type="text"
                    name="token"
                    id="token"
                    value={whatsappSettings.token}
                    onChange={handleInputChange}
                    placeholder="Token de acesso da API do WhatsApp"
                  />
                </FormGroup>
                <Button color="primary" onClick={handleSave}>
                  Salvar Configurações
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WhatsAppIntegration;
