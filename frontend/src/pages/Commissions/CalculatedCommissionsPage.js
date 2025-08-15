import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert, Modal, ModalHeader, ModalBody, Badge, Table } from 'reactstrap';
import { motion } from 'framer-motion';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { Check } from 'react-feather'; // For mark as paid icon
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available
import ConfirmationModal from '../../components/Common/ConfirmationModal';

import './CalculatedCommissionsPage.scss'; // Page-specific styling

const CalculatedCommissionsPage = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    salesperson_id: '',
    status: '',
  });
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [commissionToMarkPaid, setCommissionToMarkPaid] = useState(null);
  const [refreshList, setRefreshList] = useState(false);

  const debouncedFilters = useDebounce(filters, 500);

  const { data: commissions, isLoading, error, refresh } = useApi('/api/commissions/calculated', { params: debouncedFilters });
  const { request: markCommissionPaidApi, isLoading: isMarkingPaid } = useApi('put');
  const { data: salespersonsData, isLoading: loadingSalespersons, error: salespersonsError } = useApi('get', '/api/users?role=salesperson'); // Assuming an API to get salespersons

  const salespersonOptions = salespersonsData?.users?.map(s => ({ value: s.id, label: s.name })) || [];
  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
  ];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkAsPaid = (commission) => {
    setCommissionToMarkPaid(commission);
    setConfirmationModalOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    try {
      await markCommissionPaidApi(`/api/commissions/calculated/${commissionToMarkPaid.id}/mark-paid`, { status: 'paid' });
      toast.success('Comissão marcada como paga com sucesso!');
      setRefreshList(prev => !prev);
    } catch (err) {
      toast.error(err.message || 'Falha ao marcar comissão como paga.');
    } finally {
      setConfirmationModalOpen(false);
      setCommissionToMarkPaid(null);
    }
  };

  useEffect(() => {
    refresh(); // Initial fetch and re-fetch on filter/refreshList change
  }, [debouncedFilters, refresh, refreshList]);

  return (
    <motion.div
      className="calculated-commissions-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Comissões Calculadas</h1>
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
                      <Label for="status">Status:</Label>
                      <Select
                        options={statusOptions}
                        isClearable
                        placeholder="Filtrar por status..."
                        onChange={(val) => handleFilterChange('status', val ? val.value : '')}
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
                <CardTitle tag="h5" className="mb-4">Lista de Comissões</CardTitle>
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando comissões...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar comissões: {error.message}</Alert>
                ) : commissions && commissions.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-hover table-striped mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Vendedor/Técnico</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Data de Cálculo</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map(commission => (
                          <tr key={commission.id}>
                            <td>{commission.id}</td>
                            <td>{commission.salesperson_name || 'N/A'}</td>
                            <td>
                              <Badge color="primary">{commission.type === 'product' ? 'Produto' : commission.type === 'service' ? 'Serviço' : commission.type === 'salesperson' ? 'Vendedor' : 'Vendas Totais'}</Badge>
                            </td>
                            <td>{commission.value_type === 'percentage' ? `${commission.value}%` : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(commission.value)}</td>
                            <td>{new Date(commission.calculated_date).toLocaleDateString('pt-BR')}</td>
                            <td>
                              <Badge color={commission.status === 'paid' ? 'success' : 'warning'}>
                                {commission.status === 'paid' ? 'Pago' : 'Pendente'}
                              </Badge>
                            </td>
                            <td>
                              {commission.status === 'pending' && (
                                <Button color="light" size="sm" onClick={() => handleMarkAsPaid(commission)} disabled={isMarkingPaid}>
                                  <Check size={16} /> Marcar como Pago
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert color="info" className="text-center">Nenhuma comissão encontrada.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        message={`Tem certeza que deseja excluir a comissão #${commissionToMarkPaid?.id} como paga?`}
        title="Confirmar Pagamento"
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={confirmMarkAsPaid}
      />
    </motion.div>
  );
};

export default CalculatedCommissionsPage;
