import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Container, Row, Col, Card, CardBody, CardTitle, 
  Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter, 
  Form, FormGroup, Label, Input, FormFeedback, Spinner 
} from "reactstrap";

import useApi from "../../hooks/useApi";
import { get, post, put, del } from "../../helpers/api_helper";
import AdvancedTable from "../../components/Common/AdvancedTable";
import toast from 'react-hot-toast';

const Suppliers = () => {
  // States para UI e Modal
  const [modal, setModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  const [formErrors, setFormErrors] = useState({});

  // Hooks da API
  const { data: suppliersData, loading: loadingSuppliers, request: fetchSuppliersApi } = useApi(get);
  const { request: addSupplierApi, loading: addingSupplier } = useApi(post);
  const { request: updateSupplierApi, loading: updatingSupplier } = useApi(put);
  const { request: deleteSupplierApi, loading: deletingSupplier } = useApi(del);

  const suppliers = suppliersData?.suppliers || [];

  const fetchSuppliers = useCallback(() => {
    fetchSuppliersApi('/api/suppliers'); 
  }, [fetchSuppliersApi]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const toggle = () => {
    setModal(!modal);
    if (modal) {
      setSelectedSupplier(null);
      setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '' });
      setFormErrors({});
    }
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
    setSelectedSupplier(null);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    setFormErrors({});
    toggle();
  };

  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({ ...supplier });
    setFormErrors({});
    toggle();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const promise = selectedSupplier
      ? updateSupplierApi(`/api/suppliers/${selectedSupplier.id}`, formData)
      : addSupplierApi('/api/suppliers', formData);

    try {
      await promise;
      fetchSuppliers();
      toggle();
      toast.success(`Fornecedor ${selectedSupplier ? 'atualizado' : 'adicionado'} com sucesso!`);
    } catch (err) {
      toast.error(`Erro ao salvar fornecedor: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await deleteSupplierApi(`/api/suppliers/${id}`);
        fetchSuppliers();
        toast.success('Fornecedor excluído com sucesso!');
      } catch (err) {
        toast.error(`Erro ao excluir fornecedor: ${err.message || 'Erro desconhecido'}`);
      }
    }
  };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: '#' },
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'contactPerson', header: 'Contato' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Telefone' },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div>
            <Button color="info" size="sm" className="me-2" onClick={(e) => { e.stopPropagation(); handleEditClick(supplier); }}>Editar</Button>
            <Button color="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(supplier.id); }} disabled={deletingSupplier}>
              {deletingSupplier ? <Spinner size="sm" /> : 'Excluir'}
            </Button>
          </div>
        );
      }
    }
  ], [deletingSupplier, fetchSuppliers]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <AdvancedTable
                    columns={columns}
                    data={suppliers}
                    loading={loadingSuppliers}
                    actions={
                      <Button color="primary" onClick={handleAddClick}>Adicionar Novo Fornecedor</Button>
                    }
                    emptyStateTitle="Nenhum Fornecedor Encontrado"
                    emptyStateMessage="Cadastre seu primeiro fornecedor para começar."
                    emptyStateActionText="Adicionar Fornecedor"
                    onEmptyStateActionClick={handleAddClick}
                  />

                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={modal} toggle={toggle} fade={false}>
        <ModalHeader toggle={toggle}>{selectedSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="name">Nome</Label>
              <Input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} invalid={!!formErrors.name} required />
              <FormFeedback>{formErrors.name}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="contactPerson">Pessoa de Contato</Label>
              <Input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} invalid={!!formErrors.email} />
              <FormFeedback>{formErrors.email}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for="phone">Telefone</Label>
              <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="address">Endereço</Label>
              <Input type="textarea" name="address" id="address" value={formData.address} onChange={handleInputChange} />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" disabled={addingSupplier || updatingSupplier}>
              {(addingSupplier || updatingSupplier) && <Spinner size="sm" />}
              {' '}{selectedSupplier ? 'Salvar Alterações' : 'Adicionar'}
            </Button>{' '}
            <Button color="secondary" onClick={toggle}>Cancelar</Button>
          </ModalFooter>
        </Form>
      </Modal>
    </React.Fragment>
  )
}

export default Suppliers;
