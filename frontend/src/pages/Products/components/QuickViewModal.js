import React, { useContext } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Table,
  Badge,
} from 'reactstrap';
import { ProductContext } from '../../../context/ProductContext';
import { NumericFormat } from 'react-number-format';
import placeholderImage from '../../../assets/images/placeholder.svg';
import './QuickViewModal.scss';

const QuickViewModal = () => {
  const { ui, setQuickViewProduct } = useContext(ProductContext);
  const { quickViewProduct: product } = ui;

  const isOpen = product !== null;
  const toggle = () => setQuickViewProduct(null);

  if (!isOpen) {
    return null;
  }

  const mainImage = product.variations?.find(v => v.image_url)?.image_url || placeholderImage;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>{product.name}</ModalHeader>
      <ModalBody>
        <Row>
          <Col md="5" className="quick-view-image-col">
            <img src={mainImage} alt={product.name} className="img-fluid rounded" />
            <div className="mt-2">
              <p className="mb-1"><strong>Categoria:</strong> {product.category?.name || 'N/A'}</p>
              <p className="mb-1"><strong>Tipo:</strong> <Badge color={product.productType === 'physical' ? 'info' : 'secondary'}>{product.productType === 'physical' ? 'Físico' : 'Serviço'}</Badge></p>
              <p className="mb-1"><strong>SKU:</strong> {product.sku || 'N/A'}</p>
            </div>
          </Col>
          <Col md="7">
            <h4>Variações de Produto</h4>
            <p>{product.description || 'Este produto não tem uma descrição detalhada.'}</p>
            <div className="table-responsive">
              <Table className="variations-table">
                <thead>
                  <tr>
                    <th>Variação</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variations && product.variations.length > 0 ? (
                    product.variations.map(v => (
                      <tr key={v.id}>
                        <td>{v.name}</td>
                        <td><NumericFormat value={v.price} displayType={'text'} thousandSeparator="." decimalSeparator="," prefix={'R$ '} /></td>
                        <td><Badge color={v.stock_quantity > 0 ? 'success' : 'danger'} pill>{v.stock_quantity}</Badge></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">Nenhuma variação encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default QuickViewModal;
