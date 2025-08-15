import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, Modal } from 'reactstrap';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed

import UsedProductForm from './components/UsedProductForm';
import UsedProductList from './components/UsedProductList';

import './UsedProductsPage.scss'; // Page-specific styling

const UsedProductsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(false); // State to trigger list refresh

  // Fetch used products data
  const { request: fetchUsedProducts, data: usedProducts, isLoading, error } = useApi('get');

  const loadUsedProducts = useCallback(() => {
    fetchUsedProducts('/api/used-products');
  }, [fetchUsedProducts]);

  useEffect(() => {
    loadUsedProducts();
  }, [loadUsedProducts, refreshList]); // Refresh when refreshList changes

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setRefreshList(prev => !prev); // Toggle to trigger list refresh
  };

  return (
    <motion.div
      className="used-products-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid>
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Gestão de Produtos Seminovos</h1>
              <Button color="primary" onClick={handleOpenForm}>
                <i className="bx bx-plus me-1"></i> Registrar Novo Seminovos
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card className="used-product-list-card">
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Produtos Seminovos Registrados</CardTitle>
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando produtos seminovos...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar produtos seminovos: {error.message}</Alert>
                ) : usedProducts && usedProducts.length > 0 ? (
                  <UsedProductList usedProducts={usedProducts} />
                ) : (
                  <Alert color="info" className="text-center">Nenhum produto seminovo registrado ainda.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={isFormOpen} toggle={handleCloseForm} centered size="lg">
        <UsedProductForm onClose={handleCloseForm} onSuccess={handleCloseForm} />
      </Modal>
    </motion.div>
  );
};

export default UsedProductsPage;
