import React, { useState, useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, InputGroup,
  Spinner, Alert, Row, Col
} from 'reactstrap';
import axios from 'axios';
import config from '../../../config';

const CashierModal = ({ isOpen, toggle, cashierStatus, onCashierUpdate }) => {
  const API_URL = config.api.API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [notes, setNotes] = useState('');

  const isClosing = cashierStatus?.isOpen;

  useEffect(() => {
    // Reset fields when modal opens or status changes
    setError(null);
    setOpeningBalance('');
    setClosingBalance('');
    setNotes('');
  }, [isOpen]);

  const handleOpenCashier = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/cashier/open`, {
        opening_balance: parseFloat(openingBalance)
      });
      onCashierUpdate(response.data.session);
      toggle();
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro ao abrir o caixa.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCashier = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/cashier/close`, {
        closing_balance: parseFloat(closingBalance),
        notes: notes
      });
      onCashierUpdate(null); // Indica que o caixa foi fechado
      toggle();
    } catch (err) {
      setError(err.response?.data?.msg || 'Erro ao fechar o caixa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        {isClosing ? 'Fechar Caixa' : 'Abrir Caixa'}
      </ModalHeader>
      <Form onSubmit={isClosing ? handleCloseCashier : handleOpenCashier}>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          
          {isClosing ? (
            // Formulário de Fechamento
            <>
              <Row>
                <Col>
                  <div className="text-center p-3 border rounded mb-3">
                    <h5>Saldo de Abertura</h5>
                    <p className="h4">R$ {parseFloat(cashierStatus.session.opening_balance).toFixed(2)}</p>
                  </div>
                </Col>
              </Row>
              <FormGroup>
                <Label for="closingBalance">Saldo Final em Caixa (Contado)</Label>
                <InputGroup>
                  <span className="input-group-text">R$</span>
                  <Input
                    type="number"
                    id="closingBalance"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Label for="notes">Observações</Label>
                <Input
                  type="textarea"
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormGroup>
            </>
          ) : (
            // Formulário de Abertura
            <FormGroup>
              <Label for="openingBalance">Saldo Inicial (Fundo de Troco)</Label>
              <InputGroup>
                <span className="input-group-text">R$</span>
                <Input
                  type="number"
                  id="openingBalance"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </InputGroup>
            </FormGroup>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={loading}>Cancelar</Button>
          <Button color={isClosing ? 'danger' : 'success'} type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : (isClosing ? 'Confirmar Fechamento' : 'Abrir Caixa')}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CashierModal;
