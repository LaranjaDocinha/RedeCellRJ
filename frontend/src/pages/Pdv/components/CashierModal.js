import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  Alert,
  Row,
  Col,
} from 'reactstrap';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../../components/Common/LoadingSpinner';
import { useAuthStore } from '../../../store/authStore';
import { post } from '../../../helpers/api_helper';

const CashierModal = ({ isOpen, toggle, cashierStatus, onCashierUpdate }) => {
  const { user } = useAuthStore();
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

    const parsedOpeningBalance = parseFloat(openingBalance);

    if (isNaN(parsedOpeningBalance) || parsedOpeningBalance < 0) {
      const errorMessage =
        'Por favor, insira um valor numérico válido e positivo para o saldo inicial.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    if (!user || !user.id) {
      const errorMessage = 'ID do usuário não disponível. Por favor, faça login novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        opening_balance: parsedOpeningBalance,
        userId: user.id,
      };
      const response = await post('/api/cashier/open', payload);
      onCashierUpdate(response.session);
      toast.success('Caixa aberto com sucesso!');
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Erro ao abrir o caixa.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCashier = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        closing_balance: parseFloat(closingBalance),
        notes,
        userId: user.id,
      };
      const response = await post('/api/cashier/close', payload);
      onCashierUpdate(null); // Indica que o caixa foi fechado
      toast.success('Caixa fechado com sucesso!');
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Erro ao fechar o caixa.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal centered isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{isClosing ? 'Fechar Caixa' : 'Abrir Caixa'}</ModalHeader>
      <Form onSubmit={isClosing ? handleCloseCashier : handleOpenCashier}>
        <ModalBody>
          {error && <Alert color='danger'>{error}</Alert>}

          {isClosing ? (
            // Formulário de Fechamento
            <>
              <Row>
                <Col>
                  <div className='text-center p-3 border rounded mb-3'>
                    <h5>Saldo de Abertura</h5>
                    <p className='h4'>
                      R$ {cashierStatus?.session?.opening_balance !== undefined ? parseFloat(cashierStatus.session.opening_balance).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </Col>
              </Row>
              <FormGroup>
                <Label for='closingBalance'>Saldo Final em Caixa (Contado)</Label>
                <InputGroup>
                  <span className='input-group-text'>R$</span>
                  <Input
                    required
                    id='closingBalance'
                    placeholder='0.00'
                    step='0.01'
                    type='number'
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Label for='notes'>Observações</Label>
                <Input
                  id='notes'
                  type='textarea'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </FormGroup>
            </>
          ) : (
            // Formulário de Abertura
            <FormGroup>
              <Label for='openingBalance'>Saldo Inicial (Fundo de Troco)</Label>
              <InputGroup>
                <span className='input-group-text'>R$</span>
                <Input
                  required
                  id='openingBalance'
                  placeholder='0.00'
                  step='0.01'
                  type='number'
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' disabled={loading} onClick={toggle}>
            Cancelar
          </Button>
          <Button color={isClosing ? 'danger' : 'success'} disabled={loading} type='submit'>
            {loading ? (
              <LoadingSpinner size='sm' />
            ) : isClosing ? (
              'Confirmar Fechamento'
            ) : (
              'Abrir Caixa'
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CashierModal;
