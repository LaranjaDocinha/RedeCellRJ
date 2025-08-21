import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
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

import useApi from '../../hooks/useApi';
import { get, post, put, del } from '../../helpers/api_helper';
import AdvancedTable from '../../components/Common/AdvancedTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Breadcrumbs from '../../components/Common/Breadcrumb';

const TechniciansPage = () => {
  document.title = 'Técnicos | PDV-Web';

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [formErrors, setFormErrors] = useState({});

  const { data, loading, error, request: fetchTechnicians } = useApi('get');
  const { request: addTechnician, loading: adding } = useApi('post');
  const { request: updateTechnician, loading: updating } = useApi('put');
  const { request: deleteTechnician, loading: deleting } = useApi('delete');

  const technicians = data || [];

  const loadTechnicians = useCallback(() => {
    fetchTechnicians('/api/technicians');
  }, [fetchTechnicians]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (!modalOpen) {
      setIsEditing(false);
      setSelectedTechnician(null);
      setFormData({ name: '', phone: '', email: '' });
      setFormErrors({});
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setFormData({ name: '', phone: '', email: '' });
    setModalOpen(true);
  };

  const handleEditClick = (technician) => {
    setIsEditing(true);
    setSelectedTechnician(technician);
    setFormData({
      name: technician.name,
      phone: technician.phone || '',
      email: technician.email || '',
    });
    setModalOpen(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const promise = isEditing
      ? updateTechnician(`/api/technicians/${selectedTechnician.id}`, formData)
      : addTechnician('/api/technicians', formData);

    try {
      await promise;
      loadTechnicians();
      toggleModal();
      toast.success(`Técnico ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
    } catch (err) {
      toast.error('Falha ao salvar técnico.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este técnico?')) {
      try {
        await deleteTechnician(`/api/technicians/${id}`);
        loadTechnicians();
        toast.success('Técnico excluído com sucesso!');
      } catch (err) {
        toast.error('Falha ao excluir técnico.');
      }
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: '#' },
      { accessorKey: 'name', header: 'Nome' },
      { accessorKey: 'phone', header: 'Telefone' },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          const technician = row.original;
          return (
            <div>
              <Button
                className='me-2'
                color='info'
                size='sm'
                onClick={() => handleEditClick(technician)}
              >
                Editar
              </Button>
              <Button
                color='danger'
                disabled={deleting}
                size='sm'
                onClick={() => handleDelete(technician.id)}
              >
                Excluir
              </Button>
            </div>
          );
        },
      },
    ],
    [deleting],
  );

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Técnicos' title='Cadastros' />
          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <div className='d-flex justify-content-end mb-3'>
                    <Button color='primary' onClick={handleAddClick}>
                      Adicionar Novo Técnico
                    </Button>
                  </div>
                  <AdvancedTable
                    columns={columns}
                    data={technicians}
                    loading={loading}
                    persistenceKey='techniciansTable'
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {isEditing ? 'Editar Técnico' : 'Adicionar Novo Técnico'}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for='name'>Nome</Label>
              <Input
                id='name'
                invalid={!!formErrors.name}
                name='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <FormFeedback>{formErrors.name}</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label for='phone'>Telefone</Label>
              <Input
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <FormFeedback>{formErrors.email}</FormFeedback>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={toggleModal}>
              Cancelar
            </Button>
            <Button color='primary' disabled={adding || updating} type='submit'>
              {(adding || updating) && <LoadingSpinner size='sm' />} Salvar
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </React.Fragment>
  );
};

export default TechniciansPage;
