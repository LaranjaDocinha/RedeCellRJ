import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Form,
  FormGroup,
  ListGroup,
  ListGroupItem,
  Badge,
  Alert,
  Label,
} from 'reactstrap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'react-feather';

import useApi from '../hooks/useApi';
import { get, post, del } from '../helpers/api_helper';
import Timeline from '../components/Common/Timeline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import useNotification from '../hooks/useNotification';
import Breadcrumbs from '../components/Common/Breadcrumb';

// Função para formatar a data e o valor monetário
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
const formatCurrency = (amount) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

// Função adaptadora para transformar os dados da API no formato esperado pelo componente Timeline
const adaptApiDataToTimeline = (activities) => {
  if (!activities) return [];
  return activities.map((activity) => {
    let title = 'Atividade Desconhecida';
    let description = activity.details;

    switch (activity.type) {
      case 'sale':
        title = `Compra Realizada - ${formatCurrency(activity.amount)}`;
        description = `Pagamento via: ${activity.details}`;
        break;
      case 'repair':
        title = `Ordem de Serviço #${activity.event_id}`;
        description = `Status: ${activity.details} - Custo: ${formatCurrency(activity.amount)}`;
        break;
      case 'log':
        title = 'Registro do Sistema';
        break;
      default:
        break;
    }

    return {
      title,
      description,
      timestamp: formatDate(activity.date),
      icon: activity.icon,
      color: activity.color, // Passando a cor para o componente
    };
  });
};

const CustomerHubPage = () => {
  document.title = 'Hub do Cliente | PDV Web';
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [activity, setActivity] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { request: fetchCustomerDataApi } = useApi(get);
  const { request: fetchActivitiesApi } = useApi(get);
  const { request: fetchInteractionsApi } = useApi(get);
  const { request: addInteractionApi } = useApi(post);
  const { request: deleteInteractionApi } = useApi(del);
  const { showSuccess, showError } = useNotification();

  const fetchAllCustomerData = async () => {
    try {
      setLoading(true);
      const [customerData, activityData, interactionsData] = await Promise.all([
        fetchCustomerDataApi(`/customers/${id}`),
        fetchActivitiesApi(`/customers/${id}/activity`),
        fetchInteractionsApi(`/customers/${id}/interactions`),
      ]);
      setCustomer(customerData);
      setActivity(activityData);
      setInteractions(interactionsData);
    } catch (err) {
      showError('Falha ao carregar os dados do cliente.');
      console.error(err);
      setError('Falha ao carregar os dados do cliente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCustomerData();
  }, [id]);

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!newInteraction.interaction_type || !newInteraction.notes) {
      showError('Tipo de interação e notas são obrigatórios.');
      return;
    }
    try {
      await addInteractionApi(`/customers/${id}/interactions`, newInteraction);
      showSuccess('Interação adicionada com sucesso!');
      setNewInteraction({ interaction_type: '', notes: '' });
      fetchAllCustomerData(); // Recarrega todos os dados para atualizar a lista
    } catch (err) {
      showError('Falha ao adicionar interação.');
      console.error(err);
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta interação?')) return;
    try {
      await deleteInteractionApi(`/customers/${id}/interactions/${interactionId}`);
      showSuccess('Interação excluída com sucesso!');
      fetchAllCustomerData(); // Recarrega todos os dados para atualizar a lista
    } catch (err) {
      showError('Falha ao excluir interação.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className='page-content'>
        <Container fluid>
          <LoadingSpinner />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className='page-content'>
        <Container fluid>
          <Alert color='danger'>{error}</Alert>
        </Container>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className='page-content'>
        <Container fluid>
          <Alert color='warning'>Cliente não encontrado.</Alert>
        </Container>
      </div>
    );
  }

  const timelineItems = adaptApiDataToTimeline(activity);

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Hub do Cliente' title='CRM' />

          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <h4 className='card-title'>{customer.name}</h4>
                  <p className='card-title-desc'>
                    {customer.email} | {customer.phone}
                  </p>
                  <p>Endereço: {customer.address || 'N/A'}</p>
                  <p>
                    Pontos de Fidelidade: <Badge color='info'>{customer.loyalty_points || 0}</Badge>
                  </p>
                  <hr />

                  <Row>
                    <Col md={6}>
                      <h5>Histórico de Atividades</h5>
                      {timelineItems.length === 0 ? (
                        <p>Nenhuma atividade recente para este cliente.</p>
                      ) : (
                        <Timeline items={timelineItems} />
                      )}
                    </Col>
                    <Col md={6}>
                      <h5>Interações com o Cliente</h5>
                      <Form className='mb-3' onSubmit={handleAddInteraction}>
                        <FormGroup>
                          <Label for='interaction_type'>Tipo de Interação</Label>
                          <Input
                            required
                            id='interaction_type'
                            name='interaction_type'
                            type='select'
                            value={newInteraction.interaction_type}
                            onChange={handleInteractionChange}
                          >
                            <option value=''>Selecione o Tipo</option>
                            <option value='Chamada'>Chamada</option>
                            <option value='Email'>Email</option>
                            <option value='Visita'>Visita</option>
                            <option value='Nota'>Nota</option>
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Label for='notes'>Notas da Interação</Label>
                          <Input
                            required
                            id='notes'
                            name='notes'
                            rows='3'
                            type='textarea'
                            value={newInteraction.notes}
                            onChange={handleInteractionChange}
                          />
                        </FormGroup>
                        <Button color='primary' type='submit'>
                          Adicionar Interação
                        </Button>
                      </Form>

                      <h6>Interações Anteriores</h6>
                      {interactions.length === 0 ? (
                        <p>Nenhuma interação registrada.</p>
                      ) : (
                        <ListGroup flush>
                          {interactions.map((interaction) => (
                            <ListGroupItem
                              key={interaction.id}
                              className='d-flex justify-content-between align-items-center'
                            >
                              <div>
                                <strong>{interaction.interaction_type}</strong> -{' '}
                                {format(
                                  new Date(interaction.interaction_date),
                                  'dd/MM/yyyy HH:mm',
                                  {
                                    locale: ptBR,
                                  },
                                )}
                                <p className='mb-0 text-muted'>{interaction.notes}</p>
                                <small>Registrado por: {interaction.user_name}</small>
                              </div>
                              <Button
                                outline
                                color='danger'
                                size='sm'
                                onClick={() => handleDeleteInteraction(interaction.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      )}
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default CustomerHubPage;
