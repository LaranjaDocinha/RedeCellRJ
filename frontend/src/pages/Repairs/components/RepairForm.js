import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Label, Input, Form, Alert } from 'reactstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useApi from '../../../hooks/useApi';
import { get, post, put } from '../../../helpers/api_helper';

import Breadcrumbs from '../../../components/Common/Breadcrumb';
import RichTextEditor from '../../../components/Common/RichTextEditor';

const RepairForm = () => {
  const { repairId } = useParams();
  const isEditing = !!repairId;
  const navigate = useNavigate();

  document.title = `${isEditing ? 'Editar' : 'Nova'} O.S. | RedeCellRJ PDV`;

  const [formData, setFormData] = useState({
    customerId: '',
    deviceType: '',
    brand: '',
    model: '',
    imeiSerial: '',
    problemDescription: '',
    serviceCost: 0,
    priority: 'Normal',
    tags: '',
    technicianId: '',
  });
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { request: fetchCustomersApi } = useApi(get);
  const { request: fetchTechniciansApi } = useApi(get);
  const { request: fetchRepairApi } = useApi(get);
  const { request: createRepairApi } = useApi(post);
  const { request: updateRepairApi } = useApi(put);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [customersResponse, techniciansResponse] = await Promise.all([
          fetchCustomersApi(`${process.env.REACT_APP_API_URL}/api/customers`),
          fetchTechniciansApi('/api/technicians'),
        ]);
        setCustomers(customersResponse.data.customers);
        setTechnicians(techniciansResponse.data);

        if (isEditing) {
          const repairResponse = await fetchRepairApi(`/api/repairs/${repairId}`);
          const repairData = repairResponse.data;
          setFormData({
            customerId: repairData.customer_id || '',
            deviceType: repairData.device_type || '',
            brand: repairData.brand || '',
            model: repairData.model || '',
            imeiSerial: repairData.imei_serial || '',
            problemDescription: repairData.problem_description || '',
            serviceCost: repairData.service_cost || 0,
            priority: repairData.priority || 'Normal',
            tags: (repairData.tags || []).join(', '),
            technicianId: repairData.technician_id || '',
          });
        }
      } catch (err) {
        setError('Erro ao carregar dados.');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [repairId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (isEditing) {
        await updateRepairApi(`/api/repairs/${repairId}`, formData);
      } else {
        await createRepairApi('/api/repairs', formData);
      }
      setSuccess(`Ordem de Serviço ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
      setTimeout(() => navigate('/repairs'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Erro ao ${isEditing ? 'atualizar' : 'criar'} Ordem de Serviço.`,
      );
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} O.S.:`, err);
    }
  };

  if (loading) {
    return (
      <div className='page-content'>
        <Container fluid>
          <p>Carregando...</p>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs
            breadcrumbItem={isEditing ? 'Editar O.S.' : 'Nova O.S.'}
            title='Ordens de Serviço'
          />

          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <h4 className='card-title mb-4'>
                    {isEditing ? 'Editar Ordem de Serviço' : 'Criar Nova Ordem de Serviço'}
                  </h4>
                  {error && <Alert color='danger'>{error}</Alert>}
                  {success && <Alert color='success'>{success}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='customerId'>Cliente</Label>
                        <Input
                          required
                          disabled={loading}
                          id='customerId'
                          name='customerId'
                          type='select'
                          value={formData.customerId}
                          onChange={handleChange}
                        >
                          <option value=''>Selecione um cliente</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))}
                        </Input>
                      </Col>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='deviceType'>Tipo de Aparelho</Label>
                        <Input
                          required
                          id='deviceType'
                          name='deviceType'
                          placeholder='Ex: Celular, Notebook, Tablet'
                          type='text'
                          value={formData.deviceType}
                          onChange={handleChange}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='brand'>Marca</Label>
                        <Input
                          id='brand'
                          name='brand'
                          placeholder='Ex: Samsung, Apple'
                          type='text'
                          value={formData.brand}
                          onChange={handleChange}
                        />
                      </Col>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='model'>Modelo</Label>
                        <Input
                          id='model'
                          name='model'
                          placeholder='Ex: Galaxy S21, iPhone 13'
                          type='text'
                          value={formData.model}
                          onChange={handleChange}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='imeiSerial'>IMEI/Nº de Série</Label>
                        <Input
                          id='imeiSerial'
                          name='imeiSerial'
                          placeholder='Opcional'
                          type='text'
                          value={formData.imeiSerial}
                          onChange={handleChange}
                        />
                      </Col>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='serviceCost'>Valor do Serviço para o Cliente (R$)</Label>
                        <Input
                          id='serviceCost'
                          name='serviceCost'
                          placeholder='0.00'
                          step='0.01'
                          type='number'
                          value={formData.serviceCost}
                          onChange={handleChange}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='technicianId'>Técnico Responsável</Label>
                        <Input
                          id='technicianId'
                          name='technicianId'
                          type='select'
                          value={formData.technicianId}
                          onChange={handleChange}
                        >
                          <option value=''>Nenhum</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name}
                            </option>
                          ))}
                        </Input>
                      </Col>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='priority'>Prioridade</Label>
                        <Input
                          id='priority'
                          name='priority'
                          type='select'
                          value={formData.priority}
                          onChange={handleChange}
                        >
                          <option value='Baixa'>Baixa</option>
                          <option value='Normal'>Normal</option>
                          <option value='Alta'>Alta</option>
                          <option value='Urgente'>Urgente</option>
                        </Input>
                      </Col>
                    </Row>
                    <div className='mb-3'>
                      <Label htmlFor='problemDescription'>Descrição do Problema</Label>
                      <RichTextEditor
                        placeholder='Descreva o problema do aparelho...'
                        value={formData.problemDescription}
                        onChange={(data) =>
                          handleChange({ target: { name: 'problemDescription', value: data } })
                        }
                      />
                    </div>
                    <Row>
                      <Col className='mb-3' md={6}>
                        <Label htmlFor='tags'>Tags (separadas por vírgula)</Label>
                        <Input
                          id='tags'
                          name='tags'
                          placeholder='Ex: tela quebrada, bateria'
                          type='text'
                          value={formData.tags}
                          onChange={handleChange}
                        />
                      </Col>
                    </Row>
                    <Button className='mt-3' color='primary' type='submit'>
                      {isEditing ? 'Salvar Alterações' : 'Criar O.S.'}
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default RepairForm;
