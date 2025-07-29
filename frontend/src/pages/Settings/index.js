import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useApi from '../../hooks/useApi';
import { get, put } from '../../helpers/api_helper';
import { useTheme } from '../../context/ThemeContext';

import PrintSettingsForm from './components/PrintSettingsForm';
import AppearanceSettingsSection from './components/AppearanceSettingsSection';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [initialSettings, setInitialSettings] = useState({});

  const { loading: loadingSettings, request: fetchSettings } = useApi(get);
  const { loading: savingSettings, request: saveSettings } = useApi(put);
  const { setPrimaryColor } = useTheme();

  const loadSettings = useCallback(() => {
    fetchSettings('/api/settings')
      .then((data) => {
        setSettings(data);
        setInitialSettings(data);
      })
      .catch((err) => {
        toast.error(`Erro ao carregar configurações: ${err.message}`);
      });
  }, [fetchSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) {
      toast.info('Nenhuma alteração para salvar.');
      return;
    }
    try {
      await saveSettings('/api/settings', settings);

      toast.success(
        'Configurações salvas com sucesso! A página será recarregada para aplicar as mudanças.',
      );

      // Recarrega a página para que o navegador busque os novos logos/favicons
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      toast.error(`Erro ao salvar configurações: ${err.message}`);
    }
  };

  if (loadingSettings && Object.keys(initialSettings).length === 0) {
    return (
      <div className='page-content'>
        <Container fluid>
          <LoadingSpinner>Carregando...</LoadingSpinner>
        </Container>
      </div>
    );
  }

  return (
    <div className='page-content'>
      <Container fluid>
        <Row>
          <Col lg={8}>
            <Card>
              <CardBody>
                <CardTitle className='h4 mb-4'>Configurações Gerais da Loja</CardTitle>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_name'>Nome da Loja</Label>
                        <Input
                          id='store_name'
                          name='store_name'
                          value={settings.store_name || ''}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_cnpj'>CNPJ</Label>
                        <Input
                          id='store_cnpj'
                          name='store_cnpj'
                          value={settings.store_cnpj || ''}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <Label for='store_address'>Endereço</Label>
                    <Input
                      id='store_address'
                      name='store_address'
                      value={settings.store_address || ''}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_phone'>Telefone</Label>
                        <Input
                          id='store_phone'
                          name='store_phone'
                          value={settings.store_phone || ''}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className='d-flex justify-content-end mt-3'>
                    <Button color='primary' disabled={savingSettings || !isDirty} type='submit'>
                      {savingSettings ? <LoadingSpinner size='sm' /> : 'Salvar Alterações'}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <CardBody>
                <CardTitle className='h5'>Visualização do Logo</CardTitle>
                {settings.store_logo_url ? (
                  <img
                    alt='Logo da loja'
                    src={settings.store_logo_url}
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                ) : (
                  <Alert color='secondary' fade={false}>
                    Nenhuma URL de logo definida.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className='mt-4'>
          <Col lg={8}>
            <AppearanceSettingsSection handleInputChange={handleInputChange} settings={settings} />
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <PrintSettingsForm />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SettingsPage;
