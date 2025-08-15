import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Badge, Spinner, Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';

import useApi from '../../hooks/useApi';
import AdvancedTable from '../../components/Common/AdvancedTable';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import EmptyState from '../../components/Common/EmptyState';
import Breadcrumbs from '../../components/Common/Breadcrumb';

import ReceivableModal from './Receivables/components/ReceivableModal'; // Import ReceivableModal

const AccountsReceivable = () => {
  document.title = 'Contas a Receber | PDV Web';

  const [receivables, setReceivables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReceivable, setCurrentReceivable] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [receivableToDelete, setReceivableToDelete] = useState(null);
  const [refreshList, setRefreshList] = useState(false); // State to trigger list refresh

  const { request: fetchReceivablesApi, isLoading, error } = useApi('get');
  const { request: deleteReceivableApi, isLoading: isDeleting } = useApi('delete');

  const loadReceivables = useCallback(async () => {
    try {
      const response = await fetchReceivablesApi('/api/finance/receivables');
      setReceivables(response || []);
    } catch (err) {
      toast.error('Falha ao carregar contas a receber.');
    }
  }, [fetchReceivablesApi]);

  useEffect(() => {
    loadReceivables();
  }, [loadReceivables, refreshList]); // Refresh when refreshList changes

  const handleAddEdit = (receivable = null) => {
    setCurrentReceivable(receivable);
    setIsModalOpen(true);
  };

  const handleDelete = (receivable) => {
    setReceivableToDelete(receivable);
    setIsConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteReceivableApi(`/api/finance/receivables/${receivableToDelete.id}`);
      toast.success('Conta a receber excluída com sucesso!');
      setRefreshList(prev => !prev); // Trigger list refresh
    } catch (err) {
      toast.error(err.message || 'Falha ao excluir conta a receber.');
    } finally {
      setIsConfirmationModalOpen(false);
      setReceivableToDelete(null);
    }
  };

  const columns = [
    { header: 'Descrição', accessorKey: 'description' },
    {
      header: 'Valor',
      accessorKey: 'amount',
      cell: (info) => formatCurrency(parseFloat(info.getValue())),
    },
    {
      header: 'Vencimento',
      accessorKey: 'dueDate',
      cell: (info) => new Date(info.getValue()).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info) => {
        let color = 'secondary';
        let text = 'Pendente';
        if (info.getValue() === 'received') {
          color = 'success';
          text = 'Recebido';
        } else {
          const dueDate = new Date(info.row.original.dueDate);
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
      accessorKey: 'actions',
      cell: (info) => (
        <div className='d-flex gap-2'>
          <Button color='light' size='sm' onClick={() => handleAddEdit(info.row.original)}>
            Editar
          </Button>
          <Button color='light' size='sm' onClick={() => handleDelete(info.row.original)} disabled={isDeleting}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="accounts-receivable-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Breadcrumbs breadcrumbItem='Contas a Receber' title='Finanças' />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <CardTitle className='h4 mb-0'>Lista de Contas a Receber</CardTitle>
                  <Button color='primary' onClick={() => handleAddEdit()}>
                    <i className='bx bx-plus me-1'></i> Adicionar Conta a Receber
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando contas a receber...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar contas a receber: {error.message}</Alert>
                ) : receivables && receivables.length === 0 ? (
                  <Alert color="info" className="text-center">Nenhuma conta a receber encontrada.</Alert>
                ) : (
                  <AdvancedTable
                    columns={columns}
                    data={receivables || []}
                    persistenceKey='accountsReceivableTable'
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered size="lg">
          <ModalHeader toggle={() => setIsModalOpen(false)}>
            {currentReceivable ? 'Editar Conta a Receber' : 'Adicionar Nova Conta a Receber'}
          </ModalHeader>
          <ModalBody>
            <ReceivableModal
              receivable={currentReceivable}
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
          message={`Tem certeza que deseja excluir a conta a receber "${receivableToDelete?.description}"?`}
          title='Confirmar Exclusão'
          onClose={() => setIsConfirmationModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </Container>
    </motion.div>
  );
};

// Local definition of formatCurrency
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// Remove the old ReceivableModal component definition from here
// const ReceivableModal = ({ receivable, onClose, onSave }) => { ... };

export default AccountsReceivable;
