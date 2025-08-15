import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert, Modal } from 'reactstrap';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { get } from '../../helpers/api_helper';

import GiftCardForm from './components/GiftCardForm';
import GiftCardList from './components/GiftCardList';

import './GiftCardsPage.scss'; // Page-specific styling

const GiftCardsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(false); // State to trigger list refresh

  // Fetch gift cards data
  const { request: fetchGiftCards, data: giftCards, isLoading, error } = useApi(get);

  const loadGiftCards = useCallback(() => {
    fetchGiftCards('/api/gift-cards');
  }, [fetchGiftCards]);

  useEffect(() => {
    loadGiftCards();
  }, [loadGiftCards, refreshList]); // Refresh when refreshList changes

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setRefreshList(prev => !prev); // Toggle to trigger list refresh
  };

  return (
    <motion.div
      className="gift-cards-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid>
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Gestão de Vales-Presente</h1>
              <Button color="primary" onClick={handleOpenForm}>
                <i className="bx bx-plus me-1"></i> Emitir Novo Vale-Presente
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card className="gift-card-list-card">
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Vales-Presente Emitidos</CardTitle>
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando vales-presente...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar vales-presente: {error.message}</Alert>
                ) : giftCards && giftCards.length > 0 ? (
                  <GiftCardList giftCards={giftCards} />
                ) : (
                  <Alert color="info" className="text-center">Nenhum vale-presente emitido ainda.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={isFormOpen} toggle={handleCloseForm} centered size="lg">
        <GiftCardForm onClose={handleCloseForm} onSuccess={handleCloseForm} />
      </Modal>
    </motion.div>
  );
};

export default GiftCardsPage;
