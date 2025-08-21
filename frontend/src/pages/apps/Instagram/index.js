import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, FormGroup, Label, Input, Button } from 'reactstrap';
import { get, put } from '../../../helpers/api_helper'; // Ajuste o caminho conforme necessário
import useNotification from '../../../hooks/useNotification'; // Ajuste o caminho conforme necessário

const InstagramIntegration = () => {
  document.title = 'Configurações do Instagram | PDV Web';

  const { showSuccess, showError } = useNotification();
  const [instagramSettings, setInstagramSettings] = useState({
    enabled: false,
    accessToken: '',
    // Adicione outros campos de configuração do Instagram aqui
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await get('/api/settings');
        if (response.apps_settings && response.apps_settings.instagram) {
          setInstagramSettings(response.apps_settings.instagram);
        }
      } catch (err) {
        console.error('Erro ao buscar configurações do Instagram:', err);
        showError('Não foi possível carregar as configurações do Instagram.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInstagramSettings((prevSettings) => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      await put('/api/settings/apps_settings.instagram', { value: instagramSettings });
      showSuccess('Configurações do Instagram salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações do Instagram:', err);
      showError('Erro ao salvar configurações do Instagram.');
    }
  };

  if (loading) {
    return (
      <div className='page-content'>
        <Container fluid>
          <p>Carregando configurações do Instagram...</p>
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
                <CardTitle className='mb-4'>Configurações do Instagram</CardTitle>
                <FormGroup check className="mb-3">
                  <Input
                    type="checkbox"
                    name="enabled"
                    id="instagramEnabled"
                    checked={instagramSettings.enabled}
                    onChange={handleInputChange}
                  />
                  <Label for="instagramEnabled" check>Habilitar Integração com Instagram</Label>
                </FormGroup>
                <FormGroup>
                  <Label for="accessToken">Token de Acesso</Label>
                  <Input
                    type="text"
                    name="accessToken"
                    id="accessToken"
                    value={instagramSettings.accessToken}
                    onChange={handleInputChange}
                    placeholder="Token de acesso da API do Instagram"
                  />
                </FormGroup>
                {/* Adicione outros campos de configuração do Instagram aqui */}
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

export default InstagramIntegration;
