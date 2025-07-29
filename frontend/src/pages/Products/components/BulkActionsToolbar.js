import React, { useContext } from 'react';
import { Row, Col, Button } from 'reactstrap';

import { ProductContext } from '../../../context/ProductContext';
import './BulkActionsToolbar.scss';

const BulkActionsToolbar = ({ onBulkDelete }) => {
  const { selection } = useContext(ProductContext);
  const { selectedProducts } = selection;
  const count = selectedProducts.size;

  if (count === 0) {
    return null;
  }

  return (
    <div className='bulk-actions-toolbar'>
      <Row className='align-items-center'>
        <Col xs='auto'>
          <span className='fw-bold'>{count} selecionado(s)</span>
        </Col>
        <Col>
          <Button color='danger' size='sm' onClick={onBulkDelete}>
            <i className='bx bx-trash-alt me-1'></i> Excluir Seleção
          </Button>
          {/* Outras ações em massa podem ser adicionadas aqui */}
        </Col>
      </Row>
    </div>
  );
};

export default BulkActionsToolbar;
