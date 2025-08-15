import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody, Table, Row, Col } from 'reactstrap';

const SaleDetailsModal = ({ isOpen, toggle, sale }) => {
  if (!sale) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle}>Detalhes da Venda #{sale.id}</ModalHeader>
      <ModalBody>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Cliente:</strong> {sale.customer_name}
          </Col>
          <Col md={6}>
            <strong>Data da Venda:</strong> {formatDate(sale.sale_date)}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <strong>Valor Total:</strong> {formatCurrency(sale.total_amount)}
          </Col>
          <Col md={6}>
            <strong>Método de Pagamento:</strong> {sale.payment_method}
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={12}>
            <strong>Vendedor:</strong> {sale.user_name}
          </Col>
        </Row>

        <h5>Itens da Venda</h5>
        <div className="table-responsive">
          <Table className="table-bordered table-sm">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço Unitário</th>
                <th>Subtotal</th>
                <th>Número de Série</th>
              </tr>
            </thead>
            <tbody>
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price_at_sale)}</td>
                    <td>{formatCurrency(item.quantity * item.price_at_sale)}</td>
                    <td>{item.serial_number || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Nenhum item encontrado para esta venda.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </ModalBody>
    </Modal>
  );
};

SaleDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  sale: PropTypes.object,
};

export default SaleDetailsModal;
