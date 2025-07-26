import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col,
  Input, InputGroup, InputGroupText, Badge
} from 'reactstrap';
import toast from 'react-hot-toast';

const PaymentModal = ({
  isOpen,
  toggle,
  totalAmount,
  finalizeSale,
  paymentMethods,
  loading,
  cart
}) => {
  const [payments, setPayments] = useState([]);
  const [amountReceived, setAmountReceived] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Dinheiro');

  const totalPaid = useMemo(() => 
    payments.reduce((acc, p) => acc + p.amount, 0), 
  [payments]);

  const changeDue = useMemo(() => {
    const change = totalPaid - totalAmount;
    return change > 0 ? change : 0;
  }, [totalPaid, totalAmount]);

  const remainingAmount = useMemo(() => {
    const remaining = totalAmount - totalPaid;
    return remaining > 0 ? remaining : 0;
  }, [totalAmount, totalPaid]);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setPayments([]);
      setAmountReceived('');
      setSelectedMethod('Dinheiro');
    }
  }, [isOpen]);

  const handleAddPayment = () => {
    const amount = parseFloat(amountReceived);
    if (!selectedMethod || !amount || amount <= 0) {
      toast.error("Selecione um método e insira um valor válido.");
      return;
    }
    setPayments(prev => [...prev, { method: selectedMethod, amount }]);
    setAmountReceived('');
  };

  const handleQuickAdd = (value) => {
    setAmountReceived(value);
  }

  const handleFinalize = () => {
    if (cart.length === 0) {
        toast.error("Adicione itens ao carrinho antes de finalizar a venda.");
        return;
    }
    if (remainingAmount > 0) {
        toast.error("O valor pago é insuficiente.");
        return;
    }
    finalizeSale(payments);
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered backdrop="static">
      <ModalHeader toggle={toggle}>
        <i className="bx bx-wallet me-2"></i>
        Finalizar Venda
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={7} className="border-end">
            <h5 className="mb-3">Pagamento</h5>
            <InputGroup className="mb-3">
                <InputGroupText>Método</InputGroupText>
                <Input type="select" value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
                    {paymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </Input>
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroupText>R$</InputGroupText>
                <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amountReceived}
                    onChange={e => setAmountReceived(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPayment()}
                    autoFocus
                />
            </InputGroup>
            <div className="d-flex flex-wrap gap-2 mb-3">
                <Button color="secondary" outline onClick={() => handleQuickAdd(remainingAmount.toFixed(2))}>
                    Valor Exato
                </Button>
                <Button color="secondary" outline onClick={() => handleQuickAdd(50)}>R$ 50</Button>
                <Button color="secondary" outline onClick={() => handleQuickAdd(100)}>R$ 100</Button>
                <Button color="secondary" outline onClick={() => handleQuickAdd(200)}>R$ 200</Button>
            </div>
            <Button color="primary" className="w-100" onClick={handleAddPayment} disabled={!amountReceived}>
                <i className="bx bx-plus me-1"></i> Adicionar Pagamento
            </Button>

            <hr/>
            <h6 className="mt-4">Pagamentos Adicionados:</h6>
            {payments.length === 0 ? (
                <p className="text-muted">Nenhum pagamento adicionado.</p>
            ) : (
                payments.map((p, i) => (
                    <div key={i} className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-1">
                        <div><Badge color="info" className="me-2">{p.method}</Badge></div>
                        <div className="fw-bold">R$ {p.amount.toFixed(2)}</div>
                        <Button close size="sm" onClick={() => setPayments(current => current.filter((_, idx) => idx !== i))} />
                    </div>
                ))
            )}
          </Col>
          <Col md={5} className="d-flex flex-column bg-light p-4 rounded">
            <div className="text-center">
                <h6 className="text-muted">TOTAL A PAGAR</h6>
                <h1 className="display-5 fw-bold text-primary">
                    R$ {totalAmount.toFixed(2)}
                </h1>
            </div>
            <div className="mt-auto">
                <div className="d-flex justify-content-between fs-5">
                    <span>Total Pago:</span>
                    <span className="fw-bold">R$ {totalPaid.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fs-5 text-danger">
                    <span>Restante:</span>
                    <span className="fw-bold">R$ {remainingAmount.toFixed(2)}</span>
                </div>
                <hr/>
                <div className="d-flex justify-content-between fs-4 text-success">
                    <span>Troco:</span>
                    <span className="fw-bold">R$ {changeDue.toFixed(2)}</span>
                </div>
            </div>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          Cancelar
        </Button>
        <Button 
            color="success" 
            onClick={handleFinalize} 
            disabled={loading || remainingAmount > 0}
            style={{minWidth: '150px'}}
        >
          {loading ? (
            <><i className="bx bx-loader-alt bx-spin"></i> Processando...</>
          ) : (
            <><i className="bx bx-check-double me-1"></i> Confirmar Pagamento</>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PaymentModal;
