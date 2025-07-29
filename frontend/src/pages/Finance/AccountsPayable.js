import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button, // Import Button from reactstrap
  Badge, // Import Badge for status
} from 'reactstrap';
import { NumericFormat } from 'react-number-format'; // For currency formatting

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayable, setCurrentPayable] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [payableToDelete, setPayableToDelete] = useState(null);

  const api = useApi();

  const fetchPayables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/finance/payables');
      setPayables(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

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
      await api.delete(`/finance/payables/${payableToDelete.id}`);
      fetchPayables();
    } catch (err) {
      setError(err);
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

  if (loading) return <div>Carregando Contas a Pagar...</div>;
  if (error) return <div>Erro ao carregar contas a pagar: {error.message}</div>;

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
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

                  {payables.length === 0 ? (
                    <EmptyState message='Nenhuma conta a pagar encontrada.' />
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

          {isModalOpen && (
            <PayableModal
              payable={currentPayable}
              onClose={() => setIsModalOpen(false)}
              onSave={() => {
                fetchPayables();
                setIsModalOpen(false);
              }}
            />
          )}

          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            message={`Tem certeza que deseja excluir a conta a pagar "${payableToDelete?.description}"?`}
            title='Confirmar Exclusão'
            onClose={() => setIsConfirmationModalOpen(false)}
            onConfirm={confirmDelete}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

// Remove the old PayableModal component definition from here
// const PayableModal = ({ payable, onClose, onSave }) => { ... };

export default AccountsPayable;
