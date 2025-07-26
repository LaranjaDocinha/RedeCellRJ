import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import axios from 'axios';
import config from '../../config';

const StockMovementModal = ({ isOpen, toggle, variation, mode, onSuccess }) => {
  const API_URL = config.api.API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const isAddMode = mode === 'add';
  const modalTitle = isAddMode ? 'Adicionar Estoque' : 'Ajustar Estoque';
  const buttonText = isAddMode ? 'Confirmar Entrada' : 'Confirmar Ajuste';
  const labelText = isAddMode ? 'Quantidade a Adicionar' : 'Nova Quantidade Total';

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isAddMode ? `${API_URL}/api/products/stock/add` : `${API_URL}/api/products/stock/adjust`;
    const payload = {
      variation_id: variation.id,
      reason: reason,
    };

    if (isAddMode) {
      payload.quantity_added = parseInt(quantity, 10);
    } else {
      payload.new_quantity = parseInt(quantity, 10);
    }

    try {
      await axios.post(url, payload);
      onSuccess();
      toggle();
    } catch (err) {
      setError(err.response?.data?.msg || `Erro ao ${isAddMode ? 'adicionar' : 'ajustar'} estoque.`);
    } finally {
      setLoading(false);
    }
  };

  if (!variation) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>{modalTitle}: {variation.product_name} ({variation.color})</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          <p>Estoque atual: <strong>{variation.stock_quantity}</strong></p>
          <FormGroup>
            <Label for="quantity">{labelText}</Label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="reason">Motivo</Label>
            <Input
              type="text"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isAddMode ? 'Ex: Compra de fornecedor' : 'Ex: Contagem de inventário'}
              required
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading}>Cancelar</Button>
          <Button color="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : buttonText}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default StockMovementModal;
