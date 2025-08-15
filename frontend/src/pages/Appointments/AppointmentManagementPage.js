import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert, Modal, ModalHeader, ModalBody, Badge, Table } from 'reactstrap';
import { motion } from 'framer-motion';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { Edit, Trash2 } from 'react-feather';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import AppointmentBookingPage from './AppointmentBookingPage'; // Reusing the form from booking page

import 'flatpickr/dist/themes/material_blue.css'; // Example theme
import './AppointmentManagementPage.scss'; // Page-specific styling

const AppointmentManagementPage = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customer_id: '',
    service_type: '',
    search_query: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  const debouncedFilters = useDebounce(filters, 500);

  const { data: appointments, isLoading, error, request } = useApi('/api/appointments', { params: debouncedFilters });
  const { request: deleteAppointmentApi, isLoading: isDeleting } = useApi('delete');
  const { data: customersData, isLoading: loadingCustomers, error: customersError } = useApi('get', '/api/customers');

  const customerOptions = customersData?.customers?.map(c => ({ value: c.id, label: c.name })) || [];
  const serviceTypeOptions = [
    { value: 'Reparo de Celular', label: 'Reparo de Celular' },
    { value: 'Manutenção de Notebook', label: 'Manutenção de Notebook' },
    { value: 'Troca de Bateria', label: 'Troca de Bateria' },
    { value: 'Orçamento', label: 'Orçamento' },
    { value: 'Outro', label: 'Outro' },
  ];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleDelete = (appointment) => {
    setAppointmentToDelete(appointment);
    setConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAppointmentApi(`/api/appointments/${appointmentToDelete.id}`);
      toast.success('Agendamento excluído com sucesso!');
      setRefreshList(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Falha ao excluir agendamento.');
    } finally {
      setConfirmationModalOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setRefreshList(prev => !prev);
    setModalOpen(false);
  };

  useEffect(() => {
    request(); // Initial fetch and re-fetch on filter/refreshList change
  }, [debouncedFilters, request, refreshList]);

  return (
    <motion.div
      className="appointment-management-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Gestão de Agendamentos</h1>
              <Button color="primary" onClick={() => handleEdit(null)}>
                <i className="bx bx-plus me-1"></i> Novo Agendamento
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Filtros</CardTitle>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="dateRange">Período:</Label>
                      <Flatpickr
                        className="form-control d-block"
                        options={{ mode: 'range', dateFormat: 'Y-m-d' }}
                        onChange={([start, end]) => {
                          handleFilterChange('startDate', start ? start.toISOString().split('T')[0] : '');
                          handleFilterChange('endDate', end ? end.toISOString().split('T')[0] : '');
                        }}
                        placeholder="Selecione o período"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="customer_id">Cliente:</Label>
                      <Select
                        options={customerOptions}
                        isLoading={loadingCustomers}
                        isClearable
                        placeholder="Filtrar por cliente..."
                        onChange={(val) => handleFilterChange('customer_id', val ? val.value : '')}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="service_type">Tipo de Serviço:</Label>
                      <Select
                        options={serviceTypeOptions}
                        isClearable
                        placeholder="Filtrar por serviço..."
                        onChange={(val) => handleFilterChange('service_type', val ? val.value : '')}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="search_query">Buscar por Descrição/Notas:</Label>
                      <Input
                        type="text"
                        id="search_query"
                        placeholder="Buscar..."
                        onChange={(e) => handleFilterChange('search_query', e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Lista de Agendamentos</CardTitle>
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando agendamentos...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar agendamentos: {error.message}</Alert>
                ) : appointments && appointments.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-hover table-striped mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Serviço</th>
                          <th>Data</th>
                          <th>Hora</th>
                          <th>Status</th>
                          <th>Notas</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map(appointment => (
                          <tr key={appointment.id}>
                            <td>{appointment.id}</td>
                            <td>{appointment.customer_name}</td>
                            <td>{appointment.service_type}</td>
                            <td>{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</td>
                            <td>{appointment.appointment_time}</td>
                            <td>
                              <Badge color={
                                appointment.status === 'confirmed' ? 'success' :
                                appointment.status === 'pending' ? 'warning' :
                                'danger'
                              }>
                                {appointment.status === 'confirmed' ? 'Confirmado' :
                                 appointment.status === 'pending' ? 'Pendente' :
                                 'Cancelado'}
                              </Badge>
                            </td>
                            <td>{appointment.notes}</td>
                            <td>
                              <Button color="light" size="sm" className="me-2" onClick={() => handleEdit(appointment)}>
                                <Edit size={16} />
                              </Button>
                              <Button color="light" size="sm" onClick={() => handleDelete(appointment)} disabled={isDeleting}>
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert color="info" className="text-center">Nenhum agendamento encontrado.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} centered size="lg">
        <ModalHeader toggle={() => setModalOpen(false)}>
          {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </ModalHeader>
        <ModalBody>
          <AppointmentBookingPage // Reusing the booking form for editing
            appointment={selectedAppointment}
            onSuccess={handleFormSuccess}
            onCancel={() => setModalOpen(false)}
          />
        </ModalBody>
      </Modal>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        message={`Tem certeza que deseja excluir o agendamento de ${appointmentToDelete?.customer_name} em ${new Date(appointmentToDelete?.appointment_date).toLocaleDateString('pt-BR')} às ${appointmentToDelete?.appointment_time}?`}
        title="Confirmar Exclusão"
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
};

export default AppointmentManagementPage;
