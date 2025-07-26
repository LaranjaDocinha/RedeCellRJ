import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, CardBody, CardTitle,
  Button, Form, FormGroup, Label, Input, Spinner, Alert
} from 'reactstrap';
import useApi from '../../hooks/useApi';
import { get, put } from '../../helpers/api_helper';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [initialSettings, setInitialSettings] = useState({});

  const { loading: loadingSettings, request: fetchSettings } = useApi(get);
  const { loading: savingSettings, request: saveSettings } = useApi(put);

  const loadSettings = useCallback(() => {
    fetchSettings('/settings')
      .then(data => {
        setSettings(data);
        setInitialSettings(data);
      })
      .catch(err => {
        toast.error(`Erro ao carregar configurações: ${err.message}`);
      });
  }, [fetchSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }
    try {
      await saveSettings('/settings', settings);
      toast.success('Configurações salvas com sucesso!');
      loadSettings(); // Recarrega para atualizar o estado 'initialSettings'
    } catch (err) {
      toast.error(`Erro ao salvar configurações: ${err.message}`);
    }
  };

  if (loadingSettings && Object.keys(initialSettings).length === 0) {
    return <div className="page-content"><Container fluid><Spinner>Carregando...</Spinner></Container></div>;
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col lg={8}>
            <Card>
              <CardBody>
                <CardTitle className="h4 mb-4">Configurações Gerais da Loja</CardTitle>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="store_name">Nome da Loja</Label>
                        <Input id="store_name" name="store_name" value={settings.store_name || ''} onChange={handleInputChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="store_cnpj">CNPJ</Label>
                        <Input id="store_cnpj" name="store_cnpj" value={settings.store_cnpj || ''} onChange={handleInputChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <Label for="store_address">Endereço</Label>
                    <Input id="store_address" name="store_address" value={settings.store_address || ''} onChange={handleInputChange} />
                  </FormGroup>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="store_phone">Telefone</Label>
                        <Input id="store_phone" name="store_phone" value={settings.store_phone || ''} onChange={handleInputChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for="store_logo_url">URL do Logo</Label>
                        <Input id="store_logo_url" name="store_logo_url" type="url" value={settings.store_logo_url || ''} onChange={handleInputChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  
                  <div className="d-flex justify-content-end mt-3">
                    <Button color="primary" type="submit" disabled={savingSettings || !isDirty}>
                      {savingSettings ? <Spinner size="sm" /> : 'Salvar Alterações'}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
          <Col lg={4}>
             <Card>
                <CardBody>
                    <CardTitle className="h5">Visualização do Logo</CardTitle>
                    {settings.store_logo_url ? (
                        <img src={settings.store_logo_url} alt="Logo da loja" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }} />
                    ) : (
                        <Alert color="secondary">
                            Nenhuma URL de logo definida.
                        </Alert>
                    )}
                </CardBody>
             </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SettingsPage;
