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
import CommissionPaymentForm from './components/CommissionPaymentForm'; // Will enhance this
import { get, del } from '../../helpers/api_helper';

import 'flatpickr/dist/themes/material_blue.css'; // Example theme
import './CommissionPaymentsPage.scss'; // Page-specific styling

const CommissionPaymentsPage = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    salesperson_id: '',
    search_query: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const debouncedFilters = useDebounce(filters, 500);

  const { data: paymentsData, loading, error, request: fetchPayments } = useApi(() => get('/api/commissions/payouts', { params: debouncedFilters }));
  const { request: deletePaymentApi, loading: isDeleting } = useApi(del);
  const { data: salespersonsData, loading: loadingSalespersons, request: fetchSalespersons } = useApi(() => get('/api/users?role=salesperson'));

  const payments = paymentsData?.payouts || [];
  const salespersonOptions = salespersonsData?.users?.map(s => ({ value: s.id, label: s.name })) || [];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const handleDelete = (payment) => {
    setPaymentToDelete(payment);
    setConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      await deletePaymentApi(`/api/commissions/payouts/${paymentToDelete.id}`);
      toast.success('Pagamento de comissão excluído com sucesso!');
      fetchPayments();
    } catch (err) {
      // Error is handled by the interceptor
    } finally {
      setConfirmationModalOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    fetchPayments();
    setModalOpen(false);
    setSelectedPayment(null);
  };

  useEffect(() => {
    fetchPayments();
  }, [debouncedFilters, fetchPayments]);

  useEffect(() => {
    fetchSalespersons();
  }, [fetchSalespersons]);

  return (
    <motion.div
      className="commission-payments-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Registro de Pagamentos de Comissão</h1>
              <Button color="primary" onClick={() => {
                  setSelectedPayment(null);
                  setModalOpen(true);
              }}>
                <i className="bx bx-plus me-1"></i> Registrar Novo Pagamento
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
                      <Label for="salesperson_id">Vendedor/Técnico:</Label>
                      <Select
                        options={salespersonOptions}
                        isLoading={loadingSalespersons}
                        isClearable
                        placeholder="Filtrar por vendedor..."
                        onChange={(val) => handleFilterChange('salesperson_id', val ? val.value : '')}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="search_query">Buscar por Notas/ID:</Label>
                      <Input
                        type="text"
                        id="search_query"
                        placeholder="Buscar..."
                        value={filters.search_query}
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
                <CardTitle tag="h5" className="mb-4">Histórico de Pagamentos</CardTitle>
                {loading ? (
                  <div className="text-center"><Spinner /> Carregando pagamentos...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar pagamentos: {error.message}</Alert>
                ) : payments && payments.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-hover table-striped mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Vendedor/Técnico</th>
                          <th>Valor</th>
                          <th>Data do Pagamento</th>
                          <th>Método</th>
                          <th>Notas</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(payment => (
                          <tr key={payment.id}>
                            <td>{payment.id}</td>
                            <td>{payment.salesperson_name || 'N/A'}</td>
                            <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}</td>
                            <td>{new Date(payment.payment_date).toLocaleDateString('pt-BR')}</td>
                            <td>{payment.payment_method}</td>
                            <td>{payment.notes || 'N/A'}</td>
                            <td>
                              <Button color="light" size="sm" className="me-2" onClick={() => handleEdit(payment)}>
                                <Edit size={16} />
                              </Button>
                              <Button color="light" size="sm" onClick={() => handleDelete(payment)} disabled={isDeleting}>
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert color="info" className="text-center">Nenhum pagamento de comissão encontrado.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {modalOpen && (
          <CommissionPaymentForm
            isOpen={modalOpen}
            payment={selectedPayment}
            onSuccess={handleFormSuccess}
            onCancel={() => {
                setModalOpen(false);
                setSelectedPayment(null);
            }}
          />
      )}

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        message={`Tem certeza que deseja excluir o pagamento #${paymentToDelete?.id} de ${paymentToDelete?.salesperson_name}?`}
        title="Confirmar Exclusão"
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </motion.div>
  );
};

export default CommissionPaymentsPage;
