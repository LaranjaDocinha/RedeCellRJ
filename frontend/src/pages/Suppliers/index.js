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
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useApi from '../../hooks/useApi';
import { get, post, put, del } from '../../helpers/api_helper';
import AdvancedTable from '../../components/Common/AdvancedTable';

const Suppliers = () => {
  // States para UI e Modal
  const [modal, setModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Hooks da API
  const {
    data: suppliersData,
    loading: loadingSuppliers,
    request: fetchSuppliersApi,
  } = useApi(get);
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

  const columns = useMemo(
    () => [
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
            <div className='d-flex gap-2'>
              <Button color='light' size='sm' onClick={(e) => { e.stopPropagation(); handleEditClick(supplier); }}>
                <i className='bx bx-search-alt'></i>
              </Button>
              <Button color='primary' size='sm' onClick={(e) => { e.stopPropagation(); handleEditClick(supplier); }}>
                <i className='bx bx-pencil'></i>
              </Button>
              <Button
                color='danger'
                size='sm'
                disabled={deletingSupplier}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(supplier.id);
                }}
              >
                {deletingSupplier ? <LoadingSpinner size='sm' /> : <i className='bx bx-trash'></i>}
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingSupplier, fetchSuppliers],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <AdvancedTable
                    columns={columns}
                    data={suppliers}
                    emptyStateActionText={'Adicionar Fornecedor'}
                    emptyStateIcon={''}
                    emptyStateMessage={'Cadastre seu primeiro fornecedor.'}
                    emptyStateTitle={'Nenhum fornecedor encontrado'}
                    loading={loadingSuppliers}
                    persistenceKey='suppliersTable'
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
          {selectedSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
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
              <Label for='contactPerson'>Pessoa de Contato</Label>
              <Input
                id='contactPerson'
                name='contactPerson'
                type='text'
                value={formData.contactPerson}
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
            <Button color='primary' disabled={addingSupplier || updatingSupplier} type='submit'>
              {(addingSupplier || updatingSupplier) && <LoadingSpinner size='sm' />}{' '}
              {selectedSupplier ? 'Salvar Alterações' : 'Adicionar'}
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

export default Suppliers;
