import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Container, Row, Col, Card, CardBody, CardTitle, 
  Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter, 
  Form, FormGroup, Label, Input, FormFeedback, Spinner 
} from "reactstrap";

import useApi from "../../hooks/useApi";
import { get, post, put, del } from "../../helpers/api_helper";
import AdvancedTable from "../../components/Common/AdvancedTable"; // Importa a nova tabela

const Customers = () => {
  // States para UI e Modal
  const [modal, setModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Hooks da API
  const { data: customersData, loading: loadingCustomers, error: customersError, request: fetchCustomersApi } = useApi(get);
  const { request: addCustomer, loading: addingCustomer, error: addError } = useApi(post);
  const { request: updateCustomer, loading: updatingCustomer, error: updateError } = useApi(put);
  const { request: deleteCustomer, loading: deletingCustomer, error: deleteError } = useApi(del);

  const customers = customersData?.customers || [];

  // Busca os dados uma vez na montagem do componente
  const fetchCustomers = useCallback(() => {
    // Busca todos os clientes. A paginação e busca serão no frontend.
    // Para datasets muito grandes, a API deveria suportar paginação/busca.
    fetchCustomersApi('/customers?limit=9999'); 
  }, [fetchCustomersApi]);

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
    let errors = {};
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
      ? updateCustomer(`/customers/${selectedCustomer.id}`, formData)
      : addCustomer('/customers', formData);

    try {
      await promise;
      fetchCustomers();
      toggle();
      showToast(`Cliente ${selectedCustomer ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
    } catch (err) {
      console.error("Falha ao salvar cliente:", err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCustomer(`/customers/${id}`);
        fetchCustomers();
        showToast('Cliente excluído com sucesso!', 'success');
      } catch (err) {
        console.error("Falha ao excluir cliente:", err);
      }
    }
  };

  // Definição das colunas para a AdvancedTable
  const columns = useMemo(() => [
    { accessorKey: 'id', header: '#' },
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'phone', header: 'Telefone' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'address', header: 'Endereço' },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div>
            <Button color="info" size="sm" className="me-2" onClick={(e) => { e.stopPropagation(); handleEditClick(customer); }}>Editar</Button>
            <Button color="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }} disabled={deletingCustomer}>
              {deletingCustomer ? <Spinner size="sm" /> : 'Excluir'}
            </Button>
          </div>
        );
      }
    }
  ], [deletingCustomer, fetchCustomers]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CardTitle className="h4 mb-0">Gerenciamento de Clientes</CardTitle>
                    <Button color="primary" onClick={handleAddClick}>Adicionar Novo Cliente</Button>
                  </div>
                  
                  {toast.show && (
                    <Alert color={toast.type} isOpen={toast.show} toggle={() => setToast({ ...toast, show: false })}>
                      {toast.message}
                    </Alert>
                  )}

                  <AdvancedTable
                    columns={columns}
                    data={customers}
                    loading={loadingCustomers}
                  />

                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={modal} toggle={toggle} fade={false}>
        <ModalHeader toggle={toggle}>{selectedCustomer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</ModalHeader>
        <Form onSubmit={handleSubmitCustomer}>
          <ModalBody>
            <FormGroup>
              <Label for="name">Nome</Label>
              <Input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} invalid={!!formErrors.name} required />
              <FormFeedback>{formErrors.name}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="phone">Telefone</Label>
              <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} invalid={!!formErrors.email} />
              <FormFeedback>{formErrors.email}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="address">Endereço</Label>
              <Input type="textarea" name="address" id="address" value={formData.address} onChange={handleInputChange} />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" disabled={addingCustomer || updatingCustomer}>
              {(addingCustomer || updatingCustomer) && <Spinner size="sm" />}
              {' '}{selectedCustomer ? 'Salvar Alterações' : 'Adicionar'}
            </Button>{' '}
            <Button color="secondary" onClick={toggle}>Cancelar</Button>
          </ModalFooter>
        </Form>
      </Modal>
    </React.Fragment>
  )
}

export default Customers;
