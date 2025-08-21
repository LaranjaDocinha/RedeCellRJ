import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { motion } from 'framer-motion';
import Breadcrumb from '../../components/Common/Breadcrumb';
import BankAccountsToolbar from './components/BankAccountsToolbar';
import BankAccountsList from './components/BankAccountsList';
import BankAccountFormModal from './components/BankAccountFormModal';
import FileUpload from '../../components/BankAccounts/FileUpload'; // Import FileUpload
import TransactionMapping from '../../components/BankAccounts/TransactionMapping'; // Import TransactionMapping
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore'; // Import useAuthStore for token

import './BankAccountsPage.scss'; // Page-specific styling

const BankAccountsPage = () => {
  const { token } = useAuthStore(); // Get token
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false); // New state for import modal
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  const [importedTransactions, setImportedTransactions] = useState([]); // New state for imported transactions
  const [existingTransactions, setExistingTransactions] = useState([]); // New state for existing transactions

  const { data, isLoading, error, refresh } = useApi('/api/bank-accounts');

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      setSelectedAccount(null);
    }
  };

  const toggleImportModal = () => { // New toggle function for import modal
    setImportModalOpen(!importModalOpen);
    if (importModalOpen) {
      setImportedTransactions([]); // Clear imported transactions on close
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

  const handleImportSuccess = (parsedData) => { // New handler for successful file upload
    setImportedTransactions(parsedData);
    // Optionally fetch existing transactions here if needed for mapping
    // For now, let's assume existingTransactions are fetched when the modal opens
  };

  const handleSaveMapping = async (mappedData) => { // New handler for saving mapped transactions
    // Implement logic to send mappedData to backend
    toast.success('Mapeamento salvo com sucesso (simulado)!');
    toggleImportModal(); // Close modal after saving
  };

  // Load accounts on mount and when refreshList changes
  useEffect(() => {
    refresh();
  }, [refresh, refreshList]);

  // Fetch existing transactions when import modal opens
  useEffect(() => {
    const fetchExistingTransactions = async () => {
      if (!importModalOpen) return;
      try {
        // This is a placeholder. You'd fetch actual transactions relevant for mapping.
        // For example, unconciled transactions for a specific bank account.
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finance/transactions?status=unconciled`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch existing transactions');
        const data = await response.json();
        setExistingTransactions(data.transactions || []); // Assuming API returns { transactions: [...] }
      } catch (err) {
        console.error('Error fetching existing transactions:', err);
        toast.error('Erro ao carregar transações existentes.');
      }
    };
    fetchExistingTransactions();
  }, [importModalOpen, token]);


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
                  <div>
                    <Button color="info" onClick={toggleImportModal} className="me-2"> {/* New button */}
                      <i className="bx bx-upload me-1"></i> Importar Extrato
                    </Button>
                    <Button color="primary" onClick={handleCreate}>
                      <i className="bx bx-plus me-1"></i> Adicionar Conta
                    </Button>
                  </div>
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
              onCancel={toggleModal}
            />
          </ModalBody>
        </Modal>
      )}

      {/* New Modal for Bank Statement Import */}
      {importModalOpen && (
        <Modal isOpen={importModalOpen} toggle={toggleImportModal} centered size="xl">
          <ModalHeader toggle={toggleImportModal}>Importar Extrato Bancário</ModalHeader>
          <ModalBody>
            {importedTransactions.length === 0 ? (
              <FileUpload onFileUpload={handleImportSuccess} />
            ) : (
              <TransactionMapping
                importedTransactions={importedTransactions}
                existingTransactions={existingTransactions}
                onSaveMapping={handleSaveMapping}
              />
            )}
          </ModalBody>
        </Modal>
      )}
    </motion.div>
  );
};

export default BankAccountsPage;