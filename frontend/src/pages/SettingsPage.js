import React, { useState, useEffect } from 'react';
import { get, put } from '../helpers/api_helper';
import { Container, Row, Col, Card, CardBody, Input, FormGroup, Label, Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import toast from 'react-hot-toast';

import ConfirmationModal from '../components/Common/ConfirmationModal';
import { StoreSettingsSection, PrintSettingsSection, ChartSettingsSection } from 'pages/SettingsPage/components';
import AppearanceSettingsSection from '../pages/Settings/components/AppearanceSettingsSection';
import LoginSettingsSection from './SettingsPage/components/LoginSettingsSection';
import ProductSettingsSection from './SettingsPage/components/ProductSettingsSection';
import FinanceSettingsSection from './SettingsPage/components/FinanceSettingsSection';
import UserSettingsSection from './SettingsPage/components/UserSettingsSection';
import IntegrationsSettingsSection from './SettingsPage/components/IntegrationsSettingsSection';

const SettingsPage = () => {
  document.title = 'Configurações | PDV Web';

  const [searchTerm, setSearchTerm] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await get('/api/settings');
        setSettings(response);
      } catch (err) {
        // console.error('Erro ao buscar configurações:', err);
        setError('Não foi possível carregar as configurações.');
        toast.error('Não foi possível carregar as configurações.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: newValue,
    }));

    try {
      await put(`/api/settings/${name}`, { value: newValue });
      toast.success(`Configuração '${name}' atualizada com sucesso!`);
    } catch (err) {
      // console.error(`Erro ao atualizar configuração '${name}':`, err);
      toast.error(`Erro ao atualizar configuração '${name}'.`);
      // Optionally revert the state if the API call fails
      setSettings((prevSettings) => ({
        ...prevSettings,
        [name]: settings[name], // Revert to old value
      }));
    }
  };

  const settingsSectionsData = [
    {
      id: 'general',
      title: 'Configurações Gerais',
      description: 'Nome da loja, endereço, telefone, etc.',
      component: () => <StoreSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'appearance',
      title: 'Aparência e Tema',
      description: 'Personalize cores, fontes e logos do sistema.',
      component: () => <AppearanceSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'login',
      title: 'Configurações de Login',
      description: 'Gerencie o visual e comportamento da tela de login.',
      component: () => <LoginSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'products',
      title: 'Configurações de Produtos',
      description: 'Opções de estoque, variações, etc.',
      component: () => <ProductSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'finance',
      title: 'Configurações Financeiras',
      description: 'Moeda, impostos, métodos de pagamento.',
      component: () => <FinanceSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'users',
      title: 'Configurações de Usuários',
      description: 'Permissões, roles, autenticação.',
      component: () => <UserSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'integrations',
      title: 'Integrações',
      description: 'Conexão com outras plataformas.',
      component: () => <IntegrationsSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'print',
      title: 'Configurações de Impressão',
      description: 'Cabeçalho, rodapé, margens e tamanho do papel.',
      component: () => <PrintSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
    {
      id: 'charts',
      title: 'Configurações de Gráficos',
      description: 'Títulos de eixos, rótulos, legendas, etc.',
      component: () => <ChartSettingsSection settings={settings} handleInputChange={handleInputChange} />,
    },
  ];

  const [activeTab, setActiveTab] = useState(settingsSectionsData[0].id); // Set initial active tab

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const filteredSections = settingsSectionsData.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleResetConfirm = () => {
    // Lógica para resetar as configurações
    // Por enquanto, apenas um toast e console.log
    // console.log('Configurações resetadas para os padrões!');
    toast.success('Configurações resetadas para os padrões!');
    setResetModalOpen(false);
  };

  if (loading) {
    return (
      <div className='page-content'>
        <Container fluid>
          <p>Carregando configurações...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className='page-content'>
        <Container fluid>
          <p className='text-danger'>{error}</p>
        </Container>
      </div>
    );
  }

  return (
    <div className='page-content'>
      <Container fluid>
        <Row className='mb-4 align-items-center'>
          <Col>
            <h4 className='mb-0'>Configurações</h4>
          </Col>
          <Col className='text-end'>
            <Button color='warning' onClick={() => setResetModalOpen(true)}>
              <i className='bx bx-reset me-2'></i>Resetar para Padrões
            </Button>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <FormGroup className='mb-4'>
              <Label for='settingsSearch'>Pesquisar Configurações</Label>
              <Input
                id='settingsSearch'
                type='text'
                placeholder='Digite para pesquisar...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Nav tabs>
              {filteredSections.map((section) => (
                <NavItem key={section.id}>
                  <NavLink
                    className={activeTab === section.id ? 'active' : ''}
                    onClick={() => {
                      toggleTab(section.id);
                    }}
                  >
                    {section.title}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent activeTab={activeTab}>
              {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                  <TabPane tabId={section.id} key={section.id}>
                    <Card>
                      <CardBody>
                        {section.component()}
                      </CardBody>
                    </Card>
                  </TabPane>
                ))
              ) : (
                <TabPane tabId='no-results'>
                  <Row>
                    <Col lg={12} className='text-center'>
                      <p>Nenhuma configuração encontrada para "{searchTerm}".</p>
                    </Col>
                  </Row>
                </TabPane>
              )}
            </TabContent>
          </Col>
        </Row>
      </Container>

      <ConfirmationModal
        isOpen={resetModalOpen}
        toggle={() => setResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title='Confirmar Reset?'
        message='Tem certeza que deseja resetar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.'
      />
    </div>
  );
};

export default SettingsPage;
