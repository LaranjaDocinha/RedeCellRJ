import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { motion } from 'framer-motion';
import Breadcrumb from '../../components/Common/Breadcrumb';
import BankAccountsToolbar from './components/BankAccountsToolbar';
import BankAccountsList from './components/BankAccountsList';
import BankAccountFormModal from './components/BankAccountFormModal';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

import './BankAccountsPage.scss'; // Page-specific styling

const BankAccountsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [refreshList, setRefreshList] = useState(false); // State to trigger list refresh

  const { data, isLoading, error, refresh } = useApi('/api/bank-accounts');

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      setSelectedAccount(null);
    }
  };

  const handleCreate = () => {
    setSelectedAccount(null);
    setModalOpen(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshList(prev => !prev); // Toggle to trigger list refresh
    toggleModal(); // Close modal
  };

  // Load accounts on mount and when refreshList changes
  useEffect(() => {
    refresh();
  }, [refresh, refreshList]);

  return (
    <motion.div
      className="bank-accounts-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Breadcrumb title="Finanças" breadcrumbItem="Contas Bancárias" />
        <Row>
          <Col xs="12">
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <CardTitle tag="h5" className="mb-0">Contas Bancárias</CardTitle>
                  <Button color="primary" onClick={handleCreate}>
                    <i className="bx bx-plus me-1"></i> Adicionar Conta
                  </Button>
                </div>
                <BankAccountsToolbar /> {/* Toolbar might have filters later */}
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando contas bancárias...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar contas bancárias: {error.message}</Alert>
                ) : data && data.length > 0 ? (
                  <BankAccountsList
                    accounts={data || []}
                    isLoading={isLoading}
                    error={error}
                    onEdit={handleEdit}
                    onDeleteSuccess={handleSuccess} // Pass handleSuccess for delete refresh
                  />
                ) : (
                  <Alert color="info" className="text-center">Nenhuma conta bancária encontrada.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      {modalOpen && (
        <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg">
          <ModalHeader toggle={toggleModal}>
            {selectedAccount ? 'Editar Conta Bancária' : 'Adicionar Nova Conta Bancária'}
          </ModalHeader>
          <ModalBody>
            <BankAccountFormModal
              account={selectedAccount}
              onSuccess={handleSuccess}
              onCancel={toggleModal} // Pass onCancel prop
            />
          </ModalBody>
        </Modal>
      )}
    </motion.div>
  );
};

export default BankAccountsPage;