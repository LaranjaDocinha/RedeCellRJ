import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Alert,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useApi from '../../hooks/useApi';
import { get, post, put, del } from '../../helpers/api_helper';
import AdvancedTable from '../../components/Common/AdvancedTable'; // Importa a nova tabela

const Customers = () => {
  // States para UI e Modal
  const [modal, setModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [segmentFilter, setSegmentFilter] = useState(''); // Novo estado para o filtro de segmento

  // Hooks da API
  const {
    data: customersData,
    loading: loadingCustomers,
    error: customersError,
    request: fetchCustomersApi,
  } = useApi(get);
  const { request: addCustomer, loading: addingCustomer, error: addError } = useApi(post);
  const { request: updateCustomer, loading: updatingCustomer, error: updateError } = useApi(put);
  const { request: deleteCustomer, loading: deletingCustomer, error: deleteError } = useApi(del);

  const customers = customersData?.customers || [];

  const filteredCustomers = useMemo(() => {
    if (!segmentFilter) {
      return customers;
    }
    return customers.filter((customer) => customer.segment === segmentFilter);
  }, [customers, segmentFilter]);

  // Busca os dados uma vez na montagem do componente
  const fetchCustomers = useCallback(() => {
    // Busca todos os clientes. A paginação e busca serão no frontend.
    // Para datasets muito grandes, a API deveria suportar paginação/busca.
    fetchCustomersApi(`/api/customers?limit=9999&segment=${segmentFilter}`);
  }, [fetchCustomersApi, segmentFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Efeito para toasts de erro
  useEffect(() => {
    const anyError = addError || updateError || deleteError || customersError;
    if (anyError) {
      showToast(`Erro: ${anyError.message || 'Ocorreu um problema.'}`, 'danger');
    }
  }, [addError, updateError, deleteError, customersError]);

  const toggle = () => {
    setModal(!modal);
    if (modal) {
      setSelectedCustomer(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
      setFormErrors({});
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Nome é obrigatório.';
    if (formData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = 'Email inválido.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
    setFormErrors({});
    toggle();
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData({ ...customer });
    setFormErrors({});
    toggle();
  };

  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const promise = selectedCustomer
      ? updateCustomer('/api/customers/${selectedCustomer.id}', formData)
      : addCustomer('/api/customers', formData);

    try {
      await promise;
      fetchCustomers();
      toggle();
      showToast(
        `Cliente ${selectedCustomer ? 'atualizado' : 'adicionado'} com sucesso!`,
        'success',
      );
    } catch (err) {
      console.error('Falha ao salvar cliente:', err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCustomer('/api/customers/${id}');
        fetchCustomers();
        showToast('Cliente excluído com sucesso!', 'success');
      } catch (err) {
        console.error('Falha ao excluir cliente:', err);
      }
    }
  };

  // Definição das colunas para a AdvancedTable
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: '#' },
      { accessorKey: 'name', header: 'Nome' },
      { accessorKey: 'phone', header: 'Telefone' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'address', header: 'Endereço' },
      {
        accessorKey: 'segment',
        header: 'Segmento',
        cell: ({ row }) => {
          const segment = row.original.segment;
          let color = 'secondary';
          switch (segment) {
            case 'Ouro':
              color = 'warning';
              break;
            case 'Prata':
              color = 'info';
              break;
            case 'Em Risco':
              color = 'danger';
              break;
            default:
              color = 'secondary';
              break;
          }
          return <span className={`badge bg-${color}`}>{segment}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div>
              <Button
                className='me-2'
                color='info'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(customer);
                }}
              >
                Editar
              </Button>
              <Button
                color='danger'
                disabled={deletingCustomer}
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomer(customer.id);
                }}
              >
                {deletingCustomer ? <LoadingSpinner size='sm' /> : 'Excluir'}
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingCustomer, fetchCustomers],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <Row className='mb-3'>
                    <Col md={4}>
                      <Label for='segmentFilter'>Filtrar por Segmento:</Label>
                      <Input
                        id='segmentFilter'
                        name='segmentFilter'
                        type='select'
                        value={segmentFilter}
                        onChange={(e) => setSegmentFilter(e.target.value)}
                      >
                        <option value=''>Todos</option>
                        <option value='Ouro'>Ouro</option>
                        <option value='Prata'>Prata</option>
                        <option value='Bronze'>Bronze</option>
                        <option value='Em Risco'>Em Risco</option>
                      </Input>
                    </Col>
                    <Col className='d-flex justify-content-end align-items-end' md={8}>
                      <Button color='primary' onClick={handleAddClick}>
                        Adicionar Novo Cliente
                      </Button>
                    </Col>
                  </Row>
                  <AdvancedTable
                    columns={columns}
                    data={filteredCustomers}
                    emptyStateActionText={'Adicionar Cliente'}
                    emptyStateIcon={''}
                    emptyStateMessage={'Cadastre seu primeiro cliente para começar a vender.'}
                    emptyStateTitle={'Nenhum cliente encontrado'}
                    loading={loadingCustomers}
                    persistenceKey='customersTable'
                    onEmptyStateActionClick={handleAddClick}
                    onRowClick={handleEditClick}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal fade={false} isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>
          {selectedCustomer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
        </ModalHeader>
        <Form onSubmit={handleSubmitCustomer}>
          <ModalBody>
            <FormGroup>
              <Label for='name'>Nome</Label>
              <Input
                required
                id='name'
                invalid={!!formErrors.name}
                name='name'
                type='text'
                value={formData.name}
                onChange={handleInputChange}
              />
              <FormFeedback>{formErrors.name}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for='phone'>Telefone</Label>
              <Input
                id='phone'
                name='phone'
                type='text'
                value={formData.phone}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for='email'>Email</Label>
              <Input
                id='email'
                invalid={!!formErrors.email}
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
              />
              <FormFeedback>{formErrors.email}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for='address'>Endereço</Label>
              <Input
                id='address'
                name='address'
                type='textarea'
                value={formData.address}
                onChange={handleInputChange}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' disabled={addingCustomer || updatingCustomer} type='submit'>
              {(addingCustomer || updatingCustomer) && <LoadingSpinner size='sm' />}{' '}
              {selectedCustomer ? 'Salvar Alterações' : 'Adicionar'}
            </Button>{' '}
            <Button color='secondary' onClick={toggle}>
              Cancelar
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default Customers;
