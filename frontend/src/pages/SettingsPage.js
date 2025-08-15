import React, { useState, useEffect } from 'react';
import { get, put } from '../helpers/api_helper';
import { Container, Row, Col, Card, CardBody, Input, FormGroup, Label, Button, Nav, NavItem, NavLink, TabContent, TabPane, CardTitle } from 'reactstrap';
import toast from 'react-hot-toast';
import { NavLink as RouterNavLink } from 'react-router-dom'; // Renamed NavLink to avoid conflict

import ConfirmationModal from '../components/Common/ConfirmationModal';
import { StoreSettingsSection, PrintSettingsSection, ChartSettingsSection, NotificationSettingsSection } from 'pages/SettingsPage/components';
import AppearanceSettingsSection from '../pages/Settings/components/AppearanceSettingsSection';
import LoginSettingsSection from './SettingsPage/components/LoginSettingsSection';
import ProductSettingsSection from './SettingsPage/components/ProductSettingsSection';
import FinanceSettingsSection from './SettingsPage/components/FinanceSettingsSection';
import UserSettingsSection from './SettingsPage/components/UserSettingsSection';
import IntegrationsSettingsSection from './SettingsPage/components/IntegrationsSettingsSection';
import SettingsLogTab from './SettingsPage/components/SettingsLogTab';
import SettingsRolesAndPermissionsTab from './SettingsPage/components/SettingsRolesAndPermissionsTab'; // New import
import LoginCustomizer from '../pages/Settings/LoginCustomizer'; // New import
import ChecklistTemplatesPage from '../pages/ChecklistTemplatesPage'; // New import
import ResetSettingsSection from './SettingsPage/components/ResetSettingsSection'; // New import
import { useAuthStore } from '../store/authStore'; // Import useAuthStore

const SettingsPage = () => {
  document.title = 'Configurações | PDV Web';

  const { hasRole } = useAuthStore(); // Get hasRole from auth store

  const [searchTerm, setSearchTerm] = useState('');
  const [resetModalOpen, setResetModal] = useState(false);
  const [settings, setSettings] = useState({});
  const [pendingChanges, setPendingChanges] = useState({}); // New state for pending changes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await get('/api/settings');
        setSettings(response);
        setPendingChanges({}); // Clear pending changes on initial load
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

  const handleInputChange = (e) => { // No longer async
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: newValue,
    }));

    setPendingChanges((prevPendingChanges) => ({
      ...prevPendingChanges,
      [name]: newValue,
    }));
  };

  const handleSave = async () => {
    try {
      for (const name in pendingChanges) {
        if (Object.hasOwnProperty.call(pendingChanges, name)) {
          const value = pendingChanges[name];
          await put(`/api/settings/${name}`, { value: value });
        }
      }
      toast.success('Configurações salvas com sucesso!');
      setPendingChanges({}); // Clear pending changes after saving
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      toast.error('Erro ao salvar configurações.');
    }
  };

  const settingsSectionsData = [
    {
      id: 'general-category',
      title: 'Geral',
      children: [
        {
          id: 'general',
          title: 'Configurações Gerais',
          description: 'Nome da loja, endereço, telefone, etc.',
          component: () => <StoreSettingsSection settings={settings} handleInputChange={handleInputChange} />,
        },
      ],
    },
    {
      id: 'personalization-category',
      title: 'Personalização',
      children: [
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
          id: 'login-customization',
          title: 'Personalizar Login',
          description: 'Ajuste o layout e elementos da página de login.',
          component: () => <LoginCustomizer settings={settings} handleInputChange={handleInputChange} />, // Pass props
        },
      ],
    },
    {
      id: 'operational-category',
      title: 'Operacional',
      children: [
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
          id: 'print',
          title: 'Configurações de Impressão',
          description: 'Cabeçalho, rodapé, margens e tamanho do papel.',
          component: () => <PrintSettingsSection settings={settings} handleInputChange={handleInputChange} />,
        },
        {
          id: 'checklist-templates',
          title: 'Templates de Checklist',
          description: 'Gerencie modelos de checklist para reparos e outras operações.',
          component: () => <ChecklistTemplatesPage settings={settings} handleInputChange={handleInputChange} />, // Pass props
        },
      ],
    },
    {
      id: 'administration-category',
      title: 'Administração',
      children: [
        {
          id: 'users',
          title: 'Configurações de Usuários',
          description: 'Permissões, roles, autenticação.',
          component: () => <UserSettingsSection settings={settings} handleInputChange={handleInputChange} />,
        },
        {
          id: 'roles-permissions',
          title: 'Papéis e Permissões',
          description: 'Gerencie papéis de usuário e suas permissões.',
          component: () => <SettingsRolesAndPermissionsTab />,
        },
        {
          id: 'logs',
          title: 'Logs de Alteração',
          description: 'Histórico de todas as alterações feitas nas configurações.',
          component: () => <SettingsLogTab />,
        },
      ],
    },
    {
      id: 'notification-category',
      title: 'Notificações',
      children: [
        {
          id: 'notification-settings',
          title: 'Configurações de Notificação',
          description: 'Configure as preferências de notificação por e-mail, SMS e no aplicativo.',
          component: () => <NotificationSettingsSection settings={settings} handleInputChange={handleInputChange} />,
        },
      ],
    },
    {
      id: 'advanced-category',
      title: 'Avançado',
      children: [
        {
          id: 'integrations',
          title: 'Integrações',
          description: 'Conexão com outras plataformas.',
          component: () => <IntegrationsSettingsSection settings={settings} handleInputChange={handleInputChange} />,
        },
        {
          id: 'charts',
          title: 'Configurações de Gráficos',
          description: 'Títulos de eixos, rótulos, legendas, etc.',
          component: () => <ChartSettingsSection settings={settings} handleInputChange={handleInputChange} />,
        },
        {
          id: 'reset-settings',
          title: 'Resetar Configurações',
          description: 'Redefina todas as configurações do sistema para os valores padrão de fábrica.',
          component: () => <ResetSettingsSection />,
        },
      ],
    },
  ];

  const [activeMainTab, setActiveMainTab] = useState(settingsSectionsData[0].id); // Set initial active main tab
  const [activeSubTab, setActiveSubTab] = useState(settingsSectionsData[0].children[0].id); // Set initial active sub tab

  const toggleMainTab = (tabId) => {
    if (activeMainTab !== tabId) {
      setActiveMainTab(tabId);
      // Find the first child of the new main tab and set it as active sub tab
      const mainTab = settingsSectionsData.find(section => section.id === tabId);
      if (mainTab && mainTab.children && mainTab.children.length > 0) {
        setActiveSubTab(mainTab.children[0].id);
      }
    }
  };

  const toggleSubTab = (tabId) => {
    if (activeSubTab !== tabId) {
      setActiveSubTab(tabId);
    }
  };

  const filteredMainSections = settingsSectionsData.filter(
    (mainSection) =>
      mainSection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mainSection.children.some(childSection =>
        childSection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        childSection.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleResetConfirm = () => {
    // Lógica para resetar as configurações
    // Por enquanto, apenas um toast e console.log
    // console.log('Configurações resetadas para os padrões!');
    toast.success('Configurações resetadas para os padrões!');
    setResetModal(false);
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
          </Col>
          <Col className='text-end'>
            {/* Reset button moved to its own section */}
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

        {/* New section for additional settings links */}
        

        <Row>
          <Col lg={12}>
            <Nav tabs>
              {filteredMainSections.map((mainSection) => (
                <NavItem key={mainSection.id}>
                  <NavLink
                    className={activeMainTab === mainSection.id ? 'active' : ''}
                    onClick={() => {
                      toggleMainTab(mainSection.id);
                    }}
                  >
                    {mainSection.title}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent activeTab={activeMainTab}>
              {filteredMainSections.length > 0 ? (
                filteredMainSections.map((mainSection) => (
                  <TabPane tabId={mainSection.id} key={mainSection.id}>
                    <Card>
                      <CardBody>
                        {mainSection.children && mainSection.children.length > 0 ? (
                          <>
                            <Nav tabs className="mb-3">
                              {mainSection.children.map((childSection) => (
                                <NavItem key={childSection.id}>
                                  <NavLink
                                    className={activeSubTab === childSection.id ? 'active' : ''}
                                    onClick={() => {
                                      toggleSubTab(childSection.id);
                                    }}
                                  >
                                    {childSection.title}
                                  </NavLink>
                                </NavItem>
                              ))}
                            </Nav>
                            <TabContent activeTab={activeSubTab}>
                              {mainSection.children.map((childSection) => (
                                <TabPane tabId={childSection.id} key={childSection.id}>
                                  {childSection.component()}
                                </TabPane>
                              ))}
                            </TabContent>
                            {activeMainTab === 'personalization-category' && Object.keys(pendingChanges).length > 0 && (
                              <div className="text-end mt-3">
                                <Button color="success" onClick={handleSave}>
                                  <i className="bx bx-save me-2"></i>Salvar Alterações
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <p>Nenhuma configuração encontrada para esta categoria.</p>
                        )}
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

      </div>
  );
};

export default SettingsPage;