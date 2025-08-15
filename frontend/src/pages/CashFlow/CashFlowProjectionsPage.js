import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { motion } from 'framer-motion';
import Breadcrumb from '../../components/Common/Breadcrumb';
import ProjectionsToolbar from './components/ProjectionsToolbar';
import ProjectionsTable from './components/ProjectionsTable';
import ProjectionFormModal from './components/ProjectionFormModal';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

import './CashFlowProjectionsPage.scss'; // Page-specific styling

const CashFlowProjectionsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjection, setSelectedProjection] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  const { data, isLoading, error, refresh } = useApi('/api/cashflow/projections', { params: filters });

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (modalOpen) {
      setSelectedProjection(null);
    }
  };

  const handleCreate = () => {
    setSelectedProjection(null);
    setModalOpen(true);
  };

  const handleEdit = (projection) => {
    setSelectedProjection(projection);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    toggleModal();
    refresh();
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return (
    <motion.div
      className="cash-flow-projections-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Breadcrumb title="Finanças" breadcrumbItem="Projeções de Fluxo de Caixa" />
        <Row>
          <Col xs="12">
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <CardTitle tag="h5" className="mb-0">Projeções de Fluxo de Caixa</CardTitle>
                  <Button color="primary" onClick={handleCreate}>
                    <i className="bx bx-plus me-1"></i> Adicionar Projeção
                  </Button>
                </div>
                <ProjectionsToolbar 
                  onFilterChange={handleFilterChange} 
                  onAddClick={handleCreate} // Keep for consistency, though button above handles it
                />
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando projeções...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar projeções: {error.message}</Alert>
                ) : (
                  <ProjectionsTable
                    projections={data?.projections || []}
                    isLoading={isLoading} // Pass isLoading to table for internal loading states if needed
                    error={error} // Pass error to table for internal error states if needed
                    onEdit={handleEdit}
                    onDeleteSuccess={refresh}
                    pagination={{
                      page: data?.page,
                      pages: data?.pages,
                      total: data?.total,
                    }}
                    onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      {modalOpen && (
        <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg">
          <ModalHeader toggle={toggleModal}>
            {selectedProjection ? 'Editar Projeção' : 'Adicionar Nova Projeção'}
          </ModalHeader>
          <ModalBody>
            <ProjectionFormModal
              projection={selectedProjection}
              onSuccess={handleSuccess}
              onCancel={toggleModal} // Pass onCancel prop
            />
          </ModalBody>
        </Modal>
      )}
    </motion.div>
  );
};

export default CashFlowProjectionsPage;