import React from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

const SuccessModal = ({ isOpen, toggle, saleDetails, onPrintReceipt, onNewSale }) => {
  if (!saleDetails) return null;

  const { sale_id, total_amount, total_paid, change, sale_type, customer } = saleDetails;
  const isReturn = sale_type === 'return';

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md">
      <ModalBody className="text-center p-5">
        <div className="avatar-sm mx-auto mb-4">
          <div className="avatar-title bg-success rounded-circle text-white font-size-24">
            <i className="mdi mdi-check-all"></i>
          </div>
        </div>
        <h5>{isReturn ? 'Devolução Registrada!' : 'Venda Finalizada!'}</h5>
        <p className="text-muted">{isReturn ? 'A devolução foi registrada com sucesso.' : 'A venda foi concluída e registrada no sistema.'}</p>
        
        <div className="mt-4 text-start">
          <p className="mb-1"><strong>ID da {isReturn ? 'Devolução' : 'Venda'}:</strong> #{sale_id}</p>
          <p className="mb-1"><strong>Total {isReturn ? 'Devolvido' : 'Pago'}:</strong> R$ {parseFloat(total_paid).toFixed(2)}</p>
          {!isReturn && <p className="mb-1"><strong>Troco:</strong> R$ {parseFloat(change).toFixed(2)}</p>}
          {customer && <p className="mb-1"><strong>Cliente:</strong> {customer.name}</p>}
        </div>

        <div className="hstack gap-2 justify-content-center mt-4">
          <Button color="success" onClick={onPrintReceipt} className="btn-label">
            <i className="bx bx-printer label-icon"></i> Imprimir Recibo
          </Button>
          <Button color="primary" onClick={onNewSale} className="btn-label">
            <i className="bx bx-cart-alt label-icon"></i> Nova Venda
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default SuccessModal;
