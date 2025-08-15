import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody
} from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';

import useApi from '../../hooks/useApi';
import AdvancedTable from '../../components/Common/AdvancedTable';
// import Button from '../../components/Common/Button'; // Remove this custom Button import
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import EmptyState from '../../components/Common/EmptyState';
import Breadcrumbs from '../../components/Common/Breadcrumb'; // Import Breadcrumbs

import PayableModal from './Payables/components/PayableModal'; // Import PayableModal

const AccountsPayable = () => {
  document.title = 'Contas a Pagar | PDV Web'; // Set document title

  const [payables, setPayables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayable, setCurrentPayable] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [payableToDelete, setPayableToDelete] = useState(null);
  const [refreshList, setRefreshList] = useState(false); // State to trigger list refresh

  const { request: fetchPayablesApi, isLoading, error } = useApi('get');
  const { request: deletePayableApi, isLoading: isDeleting } = useApi('delete');

  const loadPayables = useCallback(async () => {
    try {
      const response = await fetchPayablesApi('/api/finance/payables');
      setPayables(response || []);
    } catch (err) {
      // Error handled by useApi, just toast here
      // console.error(err); // Removed console.error
      toast.error('Falha ao carregar contas a pagar.');
    }
  }, [fetchPayablesApi]);

  useEffect(() => {
    loadPayables();
  }, [loadPayables, refreshList]); // Refresh when refreshList changes

  // Calculate summary data
  const { totalPayable, overduePayable, paidPayable, pendingPayable } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let total = 0;
    let overdue = 0;
    let paid = 0;
    let pending = 0;

    payables.forEach((payable) => {
      const amount = parseFloat(payable.amount);
      total += amount;

      if (payable.status === 'paid') {
        paid += amount;
      } else {
        pending += amount; // All non-paid are considered pending for this sum
        const dueDate = new Date(payable.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          overdue += amount;
        }
      }
    });

    return {
      totalPayable: total,
      overduePayable: overdue,
      paidPayable: paid,
      pendingPayable: pending,
    };
  }, [payables]);

  const handleAddEdit = (payable = null) => {
    setCurrentPayable(payable);
    setIsModalOpen(true);
  };

  const handleDelete = (payable) => {
    setPayableToDelete(payable);
    setIsConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePayableApi(`/api/finance/payables/${payableToDelete.id}`);
      toast.success('Conta a pagar excluída com sucesso!');
      setRefreshList(prev => !prev); // Trigger list refresh
    } catch (err) {
      toast.error(err.message || 'Falha ao excluir conta a pagar.');
    } finally {
      setIsConfirmationModalOpen(false);
      setPayableToDelete(null);
    }
  };

  const columns = [
    { header: 'Descrição', accessor: 'description' },
    {
      header: 'Valor',
      accessor: 'amount',
      render: (row) => (
        <NumericFormat
          decimalSeparator={','}
          displayType={'text'}
          prefix={'R$ '}
          thousandSeparator={'.'}
          value={parseFloat(row.amount).toFixed(2)}
        />
      ),
    },
    {
      header: 'Vencimento',
      accessor: 'dueDate',
      render: (row) => new Date(row.dueDate).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        let color = 'secondary';
        let text = 'Pendente';
        if (row.status === 'paid') {
          color = 'success';
          text = 'Pago';
        } else {
          const dueDate = new Date(row.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dueDate < today) {
            color = 'danger';
            text = 'Atrasado';
          }
        }
        return <Badge color={color}>{text}</Badge>;
      },
    },
    {
      header: 'Ações',
      accessor: 'actions',
      render: (row) => (
        <div className='d-flex gap-2'>
          <Button color='secondary' size='sm' onClick={() => handleAddEdit(row)}>
            Editar
          </Button>
          <Button color='danger' size='sm' onClick={() => handleDelete(row)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="text-center my-4">
        <Spinner className="me-2" /> Carregando Contas a Pagar...
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="my-4">
        Erro ao carregar contas a pagar: {error.message || 'Erro desconhecido.'}
      </Alert>
    );
  }

  return (
    <motion.div
      className="accounts-payable-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Breadcrumbs breadcrumbItem='Contas a Pagar' title='Finanças' />

        <Row>
          {/* Card for Total Payables */}
          <Col md={6} xl={3}>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className='mini-stats-wid'>
                <CardBody>
                  <div className='d-flex'>
                    <div className='flex-grow-1'>
                      <p className='text-muted fw-medium'>Total a Pagar</p>
                      <h4 className='mb-0'>
                        <NumericFormat
                          decimalSeparator={','}
                          displayType={'text'}
                          prefix={'R$ '}
                          thousandSeparator={'.'}
                          value={totalPayable.toFixed(2)}
                        />
                      </h4>
                    </div>
                    <div className='flex-shrink-0 align-self-center'>
                      <div className='mini-stat-icon avatar-sm rounded-circle bg-primary'>
                        <span className='avatar-title'>
                          <i className='bx bx-dollar-circle font-size-24'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </Col>

          {/* Card for Overdue Payables */}
          <Col md={6} xl={3}>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className='mini-stats-wid'>
                <CardBody>
                  <div className='d-flex'>
                    <div className='flex-grow-1'>
                      <p className='text-muted fw-medium'>Contas Atrasadas</p>
                      <h4 className='mb-0'>
                        <NumericFormat
                          decimalSeparator={','}
                          displayType={'text'}
                          prefix={'R$ '}
                          thousandSeparator={'.'}
                          value={overduePayable.toFixed(2)}
                        />
                      </h4>
                    </div>
                    <div className='flex-shrink-0 align-self-center'>
                      <div className='mini-stat-icon avatar-sm rounded-circle bg-danger'>
                        <span className='avatar-title'>
                          <i className='bx bx-calendar-x font-size-24'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </Col>

          {/* Card for Paid Payables */}
          <Col md={6} xl={3}>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className='mini-stats-wid'>
                <CardBody>
                  <div className='d-flex'>
                    <div className='flex-grow-1'>
                      <p className='text-muted fw-medium'>Contas Pagas</p>
                      <h4 className='mb-0'>
                        <NumericFormat
                          decimalSeparator={','}
                          displayType={'text'}
                          prefix={'R$ '}
                          thousandSeparator={'.'}
                          value={paidPayable.toFixed(2)}
                        />
                      </h4>
                    </div>
                    <div className='flex-shrink-0 align-self-center'>
                      <div className='mini-stat-icon avatar-sm rounded-circle bg-success'>
                        <span className='avatar-title'>
                          <i className='bx bx-check-circle font-size-24'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </Col>

          {/* Card for Pending Payables */}
          <Col md={6} xl={3}>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className='mini-stats-wid'>
                <CardBody>
                  <div className='d-flex'>
                    <div className='flex-grow-1'>
                      <p className='text-muted fw-medium'>Contas Pendentes</p>
                      <h4 className='mb-0'>
                        <NumericFormat
                          decimalSeparator={','}
                          displayType={'text'}
                          prefix={'R$ '}
                          thousandSeparator={'.'}
                          value={pendingPayable.toFixed(2)}
                        />
                      </h4>
                    </div>
                    <div className='flex-shrink-0 align-self-center'>
                      <div className='mini-stat-icon avatar-sm rounded-circle bg-warning'>
                        <span className='avatar-title'>
                          <i className='bx bx-time font-size-24'></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <CardTitle className='h4 mb-0'>Lista de Contas a Pagar</CardTitle>
                  <Button color='primary' onClick={() => handleAddEdit()}>
                    <i className='bx bx-plus me-1'></i> Adicionar Conta a Pagar
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando contas a pagar...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar contas a pagar: {error.message}</Alert>
                ) : payables.length === 0 ? (
                  <Alert color="info" className="text-center">Nenhuma conta a pagar encontrada.</Alert>
                ) : (
                  <AdvancedTable
                    columns={columns}
                    data={payables}
                    persistenceKey='accountsPayableTable'
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered size="lg">
          <ModalHeader toggle={() => setIsModalOpen(false)}>
            {currentPayable ? 'Editar Conta a Pagar' : 'Adicionar Nova Conta a Pagar'}
          </ModalHeader>
          <ModalBody>
            <PayableModal
              payable={currentPayable}
              onSuccess={() => {
                setRefreshList(prev => !prev);
                setIsModalOpen(false);
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          </ModalBody>
        </Modal>

        <ConfirmationModal
          isOpen={isConfirmationModalOpen}
          message={`Tem certeza que deseja excluir a conta a pagar "${payableToDelete?.description}"?`}
          title='Confirmar Exclusão'
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </Container>
    </motion.div>
  );
};

// Remove the old PayableModal component definition from here
// const PayableModal = ({ payable, onClose, onSave }) => { ... };

export default AccountsPayable;
