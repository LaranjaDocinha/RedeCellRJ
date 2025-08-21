
import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';
import { get, post } from '../../../helpers/api_helper';

const CloseCashierModal = ({ isOpen, onClose, onClosed, onRefreshStatus }) => {
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState(null);
  const [finalAmount, setFinalAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [difference, setDifference] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFinalAmount('');
      setSummary(null);
      fetchSummary();
    }
  }, [isOpen]);

  useEffect(() => {
    if (summary && finalAmount !== '') {
      const countedAmount = parseFloat(finalAmount.replace(/[^0-9,-]+/g, '').replace(',', '.'));
      const expectedAmount = parseFloat(summary.session.initial_amount) + parseFloat(summary.totalSales);
      setDifference(countedAmount - expectedAmount);
    } else {
      setDifference(0);
    }
  }, [finalAmount, summary]);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const data = await get('/api/cashier/summary');
      setSummary(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao carregar resumo do caixa.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCashier = async () => {
    setIsLoading(true);
    try {
      const amount = parseFloat(finalAmount.replace(/[^0-9,-]+/g, '').replace(',', '.'));
      await post('/api/cashier/close', { final_amount: amount });
      toast.success('Caixa fechado com sucesso!');
      onClose();
      onRefreshStatus(); // Trigger status refresh in parent
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao fechar o caixa.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <ModalHeader tag="h4" className="border-bottom-0">
        <i className="bx bx-dollar-circle me-2"></i>Resumo do Caixa
      </ModalHeader>
      <ModalBody>
        {isLoading ? (
          <div className="text-center"><Spinner>Carregando resumo...</Spinner></div>
        ) : summary ? (
          <div>
            <p><strong>Aberto em:</strong> {new Date(summary.session.opening_time).toLocaleString()}</p>
            <p><strong>Valor Inicial:</strong> R$ {parseFloat(summary.session.initial_amount).toFixed(2).replace('.', ',')}</p>
            <p><strong>Total de Vendas:</strong> R$ {parseFloat(summary.totalSales).toFixed(2).replace('.', ',')}</p>
            <h6>Vendas por Método de Pagamento:</h6>
            <ul>
              {summary.salesByPaymentMethod.map(pm => (
                <li key={pm.payment_method}>{pm.payment_method}: R$ {parseFloat(pm.total_amount).toFixed(2).replace('.', ',')}</li>
              ))}
            </ul>
            <hr/>
            <p><strong>Valor Esperado em Caixa (Dinheiro):</strong> R$ {(parseFloat(summary.session.initial_amount) + (summary.salesByPaymentMethod.find(pm => pm.payment_method === 'Dinheiro')?.total_amount || 0)).toFixed(2).replace('.', ',')}</p>
          </div>
        ) : (
          <Alert color="danger">Não foi possível carregar o resumo do caixa.</Alert>
        )}
      </ModalBody>
      <ModalFooter className="border-top-0">
        <Button color="secondary" onClick={onClose}>Cancelar</Button>
        <Button color="primary" onClick={() => setStep(2)} disabled={isLoading || !summary}>Próximo</Button>
      </ModalFooter>
    </>
  );

  const renderStep2 = () => (
    <>
      <ModalHeader tag="h4" className="border-bottom-0">
        <i className="bx bx-calculator me-2"></i>Contagem do Caixa
      </ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="finalAmount">Valor Contado em Caixa</Label>
          <NumericFormat
            id="finalAmount"
            className="form-control form-control-lg bg-light text-dark"
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            allowNegative={false}
            decimalScale={2}
            fixedDecimalScale
            value={finalAmount}
            onValueChange={(values) => setFinalAmount(values.value)}
            placeholder="R$ 0,00"
            
          />
        </FormGroup>
        {finalAmount !== '' && (
          <Alert color={difference >= 0 ? "success" : "danger"} className="mt-3">
            Diferença: R$ {difference.toFixed(2).replace('.', ',')}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter className="border-top-0">
        <Button color="secondary" onClick={() => setStep(1)}>Voltar</Button>
        <Button color="success" onClick={handleCloseCashier} disabled={isLoading || finalAmount === ''}>
          {isLoading ? <Spinner size="sm" /> : 'Fechar Caixa'}
        </Button>
      </ModalFooter>
    </>
  );

  return (
    <Modal isOpen={isOpen} centered backdrop="static" keyboard={false} contentClassName="bg-dark text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </motion.div>
    </Modal>
  );
};

export default CloseCashierModal;
