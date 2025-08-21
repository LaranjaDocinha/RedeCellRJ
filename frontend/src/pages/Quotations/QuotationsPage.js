import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { motion } from 'framer-motion';
import Breadcrumb from '../../components/Common/Breadcrumb';
import QuotationsToolbar from './components/QuotationsToolbar';
import QuotationsTable from './components/QuotationsTable';
import QuotationFormModal from './components/QuotationFormModal';
import useApi from '../../hooks/useApi';

import './QuotationsPage.scss'; // Page-specific styling

const QuotationsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  const { data, isLoading, error, request: fetchQuotations } = useApi('get');

  const reFetchQuotations = useCallback(() => {
    fetchQuotations('/api/quotations', { params: filters });
  }, [fetchQuotations, filters]);

  useEffect(() => {
    reFetchQuotations();
  }, [reFetchQuotations]);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      setSelectedQuotation(null);
    }
  };

  const handleCreate = () => {
    setSelectedQuotation(null);
    setModalOpen(true);
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    reFetchQuotations();
    toggleModal(); // Close modal
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return (
    <motion.div
      className="quotations-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Gestão de Cotações</h1>
              <Button color="primary" onClick={handleCreate}>
                <i className="bx bx-plus me-1"></i> Nova Cotação
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs="12">
            <Card>
              <CardBody>
                <QuotationsToolbar 
                  onFilterChange={handleFilterChange} 
                  onAddClick={handleCreate} // Keep for consistency, though button above handles it
                />
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando cotações...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar cotações: {error.message}</Alert>
                ) : data && data.quotations && data.quotations.length > 0 ? (
                  <QuotationsTable
                    quotations={data?.quotations || []}
                    isLoading={isLoading} // Pass isLoading to table for internal loading states if needed
                    error={error} // Pass error to table for internal error states if needed
                    onEdit={handleEdit}
                    onDeleteSuccess={handleSuccess} // Pass handleSuccess for delete refresh
                    pagination={{
                      page: data?.page,
                      pages: data?.pages,
                      total: data?.total,
                    }}
                    onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  />
                ) : (
                  <Alert color="info" className="text-center">Nenhuma cotação encontrada.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      {modalOpen && (
        <Modal isOpen={modalOpen} toggle={toggleModal} centered size="xl">
          <ModalHeader toggle={toggleModal}>
            {selectedQuotation ? 'Editar Cotação' : 'Adicionar Nova Cotação'}
          </ModalHeader>
          <ModalBody>
            <QuotationFormModal
              quotation={selectedQuotation}
              onSuccess={handleSuccess}
              onCancel={toggleModal} // Pass onCancel prop
            />
          </ModalBody>
        </Modal>
      )}
    </motion.div>
  );
};

export default QuotationsPage;
