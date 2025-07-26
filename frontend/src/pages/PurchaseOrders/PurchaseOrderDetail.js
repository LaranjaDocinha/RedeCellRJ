import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, CardBody, CardTitle,
  Button, Table, Badge, Input, Modal, ModalHeader, ModalBody, ModalFooter, Spinner
} from 'reactstrap';
import useApi from '../../hooks/useApi';
import { get, post } from '../../helpers/api_helper';
import toast from 'react-hot-toast';

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data, loading, request: fetchOrderDetails } = useApi(get);
  const { request: receiveItemsApi, loading: receivingItems } = useApi(post);

  // State
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [itemsToReceive, setItemsToReceive] = useState([]);

  const fetchDetails = useCallback(() => {
    fetchOrderDetails(`/purchase-orders/${id}`);
  }, [fetchOrderDetails, id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (data) {
      setOrder(data.order);
      setItems(data.items);
    }
  }, [data]);

  const toggleModal = () => {
    if (!modal) {
      // Ao abrir o modal, preenche os itens a receber com a quantidade pendente
      const toReceive = items
        .filter(item => item.quantity > item.quantity_received)
        .map(item => ({
          item_id: item.id,
          product_name: item.product_name,
          color: item.color,
          quantity_ordered: item.quantity,
          quantity_received_total: item.quantity_received,
          quantity_to_receive: item.quantity - item.quantity_received, // Sugere a quantidade máxima
        }));
      setItemsToReceive(toReceive);
    }
    setModal(!modal);
  };

  const handleReceiveQuantityChange = (index, value) => {
    const updatedItems = [...itemsToReceive];
    const maxQuantity = updatedItems[index].quantity_ordered - updatedItems[index].quantity_received_total;
    // Garante que o valor não seja negativo nem maior que o pendente
    const newQuantity = Math.max(0, Math.min(Number(value), maxQuantity));
    updatedItems[index].quantity_to_receive = newQuantity;
    setItemsToReceive(updatedItems);
  };

  const handleReceiveSubmit = async () => {
    const itemsPayload = itemsToReceive
      .filter(item => item.quantity_to_receive > 0)
      .map(item => ({
        item_id: item.item_id,
        quantity: item.quantity_to_receive,
      }));

    if (itemsPayload.length === 0) {
      toast.error("Nenhuma quantidade especificada para recebimento.");
      return;
    }

    try {
      await receiveItemsApi(`/purchase-orders/${id}/receive`, { itemsToReceive: itemsPayload });
      toast.success("Itens recebidos com sucesso!");
      fetchDetails(); // Re-fetch para atualizar o status e quantidades
      toggleModal();
    } catch (error) {
      toast.error(`Erro ao receber itens: ${error.message || 'Erro desconhecido'}`);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusMap = {
      'Pendente': 'warning',
      'Recebido Parcialmente': 'info',
      'Recebido': 'success',
      'Cancelado': 'danger',
    };
    return <Badge color={statusMap[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading || !order) {
    return <div className="page-content"><Container fluid><Spinner>Loading...</Spinner></Container></div>;
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <CardTitle className="h4">Detalhes da Ordem de Compra #{order.id}</CardTitle>
                <Button color="secondary" onClick={() => navigate('/purchase-orders')}>Voltar</Button>
            </div>

            <Row className="mb-3">
                <Col md={4}><strong>Fornecedor:</strong> {order.supplier_name || 'N/A'}</Col>
                <Col md={4}><strong>Data do Pedido:</strong> {new Date(order.order_date).toLocaleDateString('pt-BR')}</Col>
                <Col md={4}><strong>Status:</strong> {getStatusBadge(order.status)}</Col>
            </Row>
            <Row>
                <Col md={4}><strong>Valor Total:</strong> R$ {parseFloat(order.total_amount).toFixed(2)}</Col>
                <Col md={8}><strong>Observações:</strong> {order.notes || 'Nenhuma'}</Col>
            </Row>

            <hr />
            <h5 className="font-size-16 mb-3">Itens</h5>
            <Table bordered responsive>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Cor/Variação</th>
                  <th>Qtde Pedida</th>
                  <th>Qtde Recebida</th>
                  <th>Custo Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.color || 'Padrão'}</td>
                    <td>{item.quantity}</td>
                    <td>{item.quantity_received}</td>
                    <td>R$ {parseFloat(item.cost_price).toFixed(2)}</td>
                    <td>R$ {(item.quantity * item.cost_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {order.status !== 'Recebido' && order.status !== 'Cancelado' && (
                <div className="d-flex justify-content-end mt-4">
                    <Button color="success" onClick={toggleModal}>
                        Registrar Recebimento de Itens
                    </Button>
                </div>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Modal de Recebimento */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg" fade={false}>
        <ModalHeader toggle={toggleModal}>Registrar Recebimento de Itens</ModalHeader>
        <ModalBody>
          <p>Especifique a quantidade de cada item que está sendo recebido agora.</p>
          <Table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Pendente</th>
                <th>Qtde a Receber</th>
              </tr>
            </thead>
            <tbody>
              {itemsToReceive.map((item, index) => (
                <tr key={item.item_id}>
                  <td>{item.product_name} ({item.color || 'Padrão'})</td>
                  <td>{item.quantity_ordered - item.quantity_received_total}</td>
                  <td>
                    <Input
                      type="number"
                      value={item.quantity_to_receive}
                      onChange={(e) => handleReceiveQuantityChange(index, e.target.value)}
                      min="0"
                      max={item.quantity_ordered - item.quantity_received_total}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Cancelar</Button>
          <Button color="primary" onClick={handleReceiveSubmit} disabled={receivingItems}>
            {receivingItems ? <Spinner size="sm" /> : 'Confirmar Recebimento'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PurchaseOrderDetail;
