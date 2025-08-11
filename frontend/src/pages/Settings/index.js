import React, { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
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
  FormFeedback, // Import FormFeedback
  Tooltip, // Import Tooltip
} from 'reactstrap';

import InputMask from 'react-input-mask';

import useNotification from '../../hooks/useNotification';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useApi from '../../hooks/useApi';
import { get, put } from '../../helpers/api_helper';
import { useTheme } from '../../context/ThemeContext';

import PrintSettingsForm from './components/PrintSettingsForm';
import AppearanceSettingsSection from './components/AppearanceSettingsSection';
import KanbanSettings from './components/KanbanSettings';
import Tabs from '../../components/Common/Tabs'; // Importa o componente Tabs

const LazyAppearanceSettingsSection = lazy(() => import('./components/AppearanceSettingsSection'));
const LazyKanbanSettings = lazy(() => import('./components/KanbanSettings'));
const LazyPrintSettingsForm = lazy(() => import('./components/PrintSettingsForm'));

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    store_name: '',
    store_cnpj: '',
    store_address: '',
    store_phone: '',
    store_street: '',
    store_number: '',
    store_neighborhood: '',
    store_city: '',
    store_state: '',
    store_zip: '',
    chart_theme: 'light', // New setting for chart theme
    daily_revenue_chart_type: 'area',
    sales_payment_method_chart_type: 'donut',
    repair_status_chart_type: 'donut',
    top_products_chart_type: 'bar',
    show_xaxis_labels: true,
    show_yaxis_labels: true,
    show_chart_legend: true,
  });
  const [initialSettings, setInitialSettings] = useState({
    store_name: '',
    store_cnpj: '',
    store_address: '',
    store_phone: '',
    store_street: '',
    store_number: '',
    store_neighborhood: '',
    store_city: '',
    store_state: '',
    store_zip: '',
    chart_theme: 'light', // New setting for chart theme
    daily_revenue_chart_type: 'area',
    sales_payment_method_chart_type: 'donut',
    repair_status_chart_type: 'donut',
    top_products_chart_type: 'bar',
    show_xaxis_labels: true,
    show_yaxis_labels: true,
    show_chart_legend: true,
  });
  const [validationErrors, setValidationErrors] = useState({}); // New state for validation errors
  const [tooltipOpen, setTooltipOpen] = useState(false); // State for CNPJ tooltip

  const { loading: loadingSettings, request: fetchSettings } = useApi(get);
  const { loading: savingSettings, request: saveSettings } = useApi(put);
  const { setPrimaryColor } = useTheme();
  const { showSuccess, showError, showInfo } = useNotification();

  const loadSettings = useCallback(() => {
    fetchSettings('/api/settings')
      .then((data) => {
        // Assuming data.store_address might be a single string initially
        // For now, we'll just set the new fields as empty or parse if possible
        setSettings({
          ...data,
          store_street: data.store_street || '',
          store_number: data.store_number || '',
          store_neighborhood: data.store_neighborhood || '',
          store_city: data.store_city || '',
          store_state: data.store_state || '',
          store_zip: data.store_zip || '',
          chart_theme: data.chart_theme || 'light',
          daily_revenue_chart_type: data.daily_revenue_chart_type || 'area',
          sales_payment_method_chart_type: data.sales_payment_method_chart_type || 'donut',
          repair_status_chart_type: data.repair_status_chart_type || 'donut',
          top_products_chart_type: data.top_products_chart_type || 'bar',
          show_xaxis_labels: data.show_xaxis_labels !== undefined ? data.show_xaxis_labels : true,
          show_yaxis_labels: data.show_yaxis_labels !== undefined ? data.show_yaxis_labels : true,
          show_chart_legend: data.show_chart_legend !== undefined ? data.show_chart_legend : true,
        });
        setInitialSettings({
          ...data,
          store_street: data.store_street || '',
          store_number: data.store_number || '',
          store_neighborhood: data.store_neighborhood || '',
          store_city: data.store_city || '',
          store_state: data.store_state || '',
          store_zip: data.store_zip || '',
          chart_theme: data.chart_theme || 'light',
          daily_revenue_chart_type: data.daily_revenue_chart_type || 'area',
          sales_payment_method_chart_type: data.sales_payment_method_chart_type || 'donut',
          repair_status_chart_type: data.repair_status_chart_type || 'donut',
          top_products_chart_type: data.top_products_chart_type || 'bar',
          show_xaxis_labels: data.show_xaxis_labels !== undefined ? data.show_xaxis_labels : true,
          show_yaxis_labels: data.show_yaxis_labels !== undefined ? data.show_yaxis_labels : true,
          show_chart_legend: data.show_chart_legend !== undefined ? data.show_chart_legend : true,
        });
      })
      .catch((err) => {
        showError(`Erro ao carregar configurações: ${err.message}`);
      });
  }, [fetchSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    validateField(name, value); // Validate field on change
  }, [validateField]);

  const handleZipChange = useCallback(async (e) => {
    const zipCode = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (zipCode.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setSettings((prev) => ({
            ...prev,
            store_street: data.logradouro || '',
            store_neighborhood: data.bairro || '',
            store_city: data.localidade || '',
            store_state: data.uf || '',
          }));
          // Clear validation error for zip if successful
          setValidationErrors((prev) => ({ ...prev, store_zip: '' }));
        } else {
          showError('CEP não encontrado.');
          setValidationErrors((prev) => ({ ...prev, store_zip: 'CEP não encontrado.' }));
        }
      } catch (error) {
        showError('Erro ao buscar CEP.');
        console.error('Erro ao buscar CEP:', error);
      }
    }
    validateField('store_zip', e.target.value); // Validate field on blur as well
  }, [validateField, showError]);

  const validateField = useCallback((name, value) => {
    let error = '';
    switch (name) {
      case 'store_name':
        if (!value.trim()) {
          error = 'Nome da Loja é obrigatório.';
        }
        break;
      case 'store_cnpj':
        if (!value.trim()) {
          error = 'CNPJ é obrigatório.';
        } else if (!/^[0-9]{14}$/.test(value.replace(/[^0-9]/g, ''))) {
          error = 'CNPJ inválido (apenas números, 14 dígitos).';
        }
        break;
      case 'store_street':
        if (!value.trim()) {
          error = 'Rua é obrigatória.';
        }
        break;
      case 'store_number':
        if (!value.trim()) {
          error = 'Número é obrigatório.';
        }
        break;
      case 'store_city':
        if (!value.trim()) {
          error = 'Cidade é obrigatória.';
        }
        break;
      case 'store_state':
        if (!value.trim()) {
          error = 'Estado é obrigatório.';
        } else if (value.length !== 2) {
          error = 'Estado deve ter 2 letras (UF).';
        }
        break;
      case 'store_zip':
        if (!value.trim()) {
          error = 'CEP é obrigatório.';
        } else if (!/^[0-9]{8}$/.test(value.replace(/[^0-9]/g, ''))) {
          error = 'CEP inválido (apenas números, 8 dígitos).';
        }
        break;
      // Add more cases for other fields as needed
      default:
        break;
    }
    }
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
    return error === ''; // Return true if valid, false if error
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields that need validation
    if (!validateField('store_name', settings.store_name || '')) isValid = false;
    if (!validateField('store_cnpj', settings.store_cnpj || '')) isValid = false;
    if (!validateField('store_street', settings.store_street || '')) isValid = false;
    if (!validateField('store_number', settings.store_number || '')) isValid = false;
    if (!validateField('store_city', settings.store_city || '')) isValid = false;
    if (!validateField('store_state', settings.store_state || '')) isValid = false;
    if (!validateField('store_zip', settings.store_zip || '')) isValid = false;

    setValidationErrors(newErrors);
    return isValid;
  }, [settings, validateField]);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário.');
      return;
    }

    if (!isDirty) {
      showInfo('Nenhuma alteração para salvar.');
      return;
    }
    try {
      await saveSettings('/api/settings', settings);

      showSuccess(
        'Configurações salvas com sucesso! A página será recarregada para aplicar as mudanças.',
      );

      // Recarrega a página para que o navegador busque os novos logos/favicons
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      showError(`Erro ao salvar configurações: ${err.message}`);
    }
  }, [isDirty, validateForm, saveSettings, showSuccess, showError, showInfo, settings]);

  if (loadingSettings && Object.keys(initialSettings).length === 0) {
    return (
      <div className='page-content'>
        <Container fluid>
          <LoadingSpinner>Carregando...</LoadingSpinner>
        </Container>
      </div>
    );
  }

  const tabs = [
    {
      title: 'Geral',
      content: (
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
                          invalid={!!validationErrors.store_name}
                        />
                        <FormFeedback>{validationErrors.store_name}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_cnpj'>
                          CNPJ
                          <i
                            className='bx bx-info-circle ms-1'
                            id='cnpjTooltip'
                            style={{ cursor: 'pointer' }}
                          ></i>
                        </Label>
                        <InputMask
                          mask="99.999.999/9999-99"
                          value={settings.store_cnpj || ''}
                          onChange={handleInputChange}
                        >
                          {(inputProps) => (
                            <Input
                              {...inputProps}
                              id='store_cnpj'
                              name='store_cnpj'
                              invalid={!!validationErrors.store_cnpj}
                            />
                          )}
                        </InputMask>
                        <FormFeedback>{validationErrors.store_cnpj}</FormFeedback>
                        <Tooltip
                          placement='right'
                          isOpen={tooltipOpen}
                          target='cnpjTooltip'
                          toggle={() => setTooltipOpen(!tooltipOpen)}
                        >
                          Insira apenas os 14 dígitos do CNPJ, sem pontos, barras ou hífens.
                        </Tooltip>
                      </FormGroup>
                    </Col>
                  </Row>
                  </Row>
                  <Row>
                    <Col md={8}>
                      <FormGroup>
                        <Label for='store_street'>Rua</Label>
                        <Input
                          id='store_street'
                          name='store_street'
                          value={settings.store_street || ''}
                          onChange={handleInputChange}
                          invalid={!!validationErrors.store_street}
                        />
                        <FormFeedback>{validationErrors.store_street}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label for='store_number'>Número</Label>
                        <Input
                          id='store_number'
                          name='store_number'
                          value={settings.store_number || ''}
                          onChange={handleInputChange}
                          invalid={!!validationErrors.store_number}
                        />
                        <FormFeedback>{validationErrors.store_number}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_neighborhood'>Bairro</Label>
                        <Input
                          id='store_neighborhood'
                          name='store_neighborhood'
                          value={settings.store_neighborhood || ''}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_city'>Cidade</Label>
                        <Input
                          id='store_city'
                          name='store_city'
                          value={settings.store_city || ''}
                          onChange={handleInputChange}
                          invalid={!!validationErrors.store_city}
                        />
                        <FormFeedback>{validationErrors.store_city}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_state'>Estado (UF)</Label>
                        <Input
                          id='store_state'
                          name='store_state'
                          value={settings.store_state || ''}
                          onChange={handleInputChange}
                          invalid={!!validationErrors.store_state}
                          maxLength={2}
                        />
                        <FormFeedback>{validationErrors.store_state}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_zip'>CEP</Label>
                        <InputMask
                            mask="99999-999"
                            value={settings.store_zip || ''}
                            onChange={handleInputChange}
                            onBlur={handleZipChange}
                          >
                            {(inputProps) => (
                              <Input
                                {...inputProps}
                                id='store_zip'
                                name='store_zip'
                                invalid={!!validationErrors.store_zip}
                              />
                            )}
                          </InputMask>
                        <FormFeedback>{validationErrors.store_zip}</FormFeedback>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label for='store_phone'>Telefone</Label>
                        <InputMask
                          mask="(99) 99999-9999"
                          maskChar="_"
                          value={settings.store_phone || ''}
                          onChange={handleInputChange}
                        >
                          {(inputProps) => (
                            <Input
                              {...inputProps}
                              id='store_phone'
                              name='store_phone'
                              type='tel'
                            />
                          )}
                        </InputMask>
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
      ),
    },
    {
      title: 'Aparência',
      content: (
        <Suspense fallback={<LoadingSpinner />}>
          <Row>
            <Col lg={8}>
              <LazyAppearanceSettingsSection handleInputChange={handleInputChange} settings={settings} />
            </Col>
          </Row>
        </Suspense>
      ),
    },
    {
      title: 'Kanban',
      content: (
        <Suspense fallback={<LoadingSpinner />}>
          <Row>
            <Col lg={8}>
              <LazyKanbanSettings />
            </Col>
          </Row>
        </Suspense>
      ),
    },
    {
      title: 'Impressão',
      content: (
        <Suspense fallback={<LoadingSpinner />}>
          <Row>
            <Col lg={8}>
              <LazyPrintSettingsForm generalSettings={settings} />
            </Col>
          </Row>
        </Suspense>
      ),
    },
  ];

  return (
    <div className='page-content'>
      <Container fluid>
        <Tabs tabs={tabs} />
      </Container>
    </div>
  );
};

export default memo(SettingsPage);
