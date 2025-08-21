
import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { motion } from 'framer-motion';
import { NumericFormat } from 'react-number-format';

const OpenCashierModal = ({ isOpen, onOpen, onClose, isLoading }) => {
  const [initialAmount, setInitialAmount] = useState('');

  const handleOpen = (e) => {
    e.preventDefault();
    const amount = parseFloat(initialAmount.replace(/[^0-9,-]+/g, '').replace(',', '.'));
    if (isNaN(amount) || amount < 0) {
        // Maybe show a toast here
        return;
    }
    onOpen(amount);
  };

  return (
    <Modal isOpen={isOpen} centered backdrop="static" keyboard={false} contentClassName="bg-dark text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ModalHeader tag="h4" className="border-bottom-0">
          <i className="bx bx-lock-open-alt me-2"></i>Abrir Caixa
        </ModalHeader>
        <Form onSubmit={handleOpen}>
          <ModalBody>
            <p className="text-muted">Você precisa abrir o caixa para iniciar as vendas.</p>
            <FormGroup>
              <Label for="initialAmount">Valor Inicial (Suprimento)</Label>
              <NumericFormat
                id="initialAmount"
                className="form-control form-control-lg bg-light text-dark"
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                allowNegative={false}
                decimalScale={2}
                fixedDecimalScale
                value={initialAmount}
                onValueChange={(values) => setInitialAmount(values.value)}
                placeholder="R$ 0,00"
                autoFocus
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="border-top-0">
            <Button color="success" type="submit" disabled={isLoading || !initialAmount}>
              {isLoading ? <Spinner size="sm" /> : 'Abrir Caixa'}
            </Button>
          </ModalFooter>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default OpenCashierModal;
