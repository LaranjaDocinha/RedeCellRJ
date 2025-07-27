import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Badge, Table, Alert } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { get } from '../../helpers/api_helper';
import { useNavigate } from 'react-router-dom';

const SalesHistory = () => {
  document.title = "Histórico de Vendas | Skote PDV";
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSalesHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get('/api/sales/history?_sort=sale_date&_order=desc');
      setSales(data.sales);
    } catch (err) {
      setError('Falha ao carregar o histórico de vendas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesHistory();
  }, [fetchSalesHistory]);

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    toggleModal();
  };

  const handleReturnClick = () => {
    if (!selectedSale) return;
    // Passar os itens para a página de PDV para devolução
    navigate('/pdv', { state: { saleToReturn: selectedSale } });
  };

  const renderSaleTypeBadge = (sale) => {
    const isReturn = sale.sale_type === 'return';
    return (
      <Badge color={isReturn ? 'danger' : 'success'} pill>
        {isReturn ? 'Devolução' : 'Venda'}
      </Badge>
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Vendas" breadcrumbItem="Histórico de Vendas" />
          {error && <Alert color="danger" timeout={0}>{error}</Alert>}
          <Row>
            <Col>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Histórico de Transações</h4>
                  {loading ? (
                    <div className="text-center"><p>Carregando...</p></div>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map(sale => (
                            <tr key={sale.id}>
                              <td>#{sale.id}</td>
                              <td>{renderSaleTypeBadge(sale)}</td>
                              <td>{new Date(sale.sale_date).toLocaleString('pt-BR')}</td>
                              <td>{sale.customer_name || 'N/A'}</td>
                              <td>R$ {parseFloat(sale.total_amount).toFixed(2)}</td>
                              <td>
                                <Button color="primary" size="sm" onClick={() => handleViewDetails(sale)}>
                                  Ver Detalhes
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal de Detalhes da Venda */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg">
        <ModalHeader toggle={toggleModal}>
          Detalhes da {selectedSale?.sale_type === 'return' ? 'Devolução' : 'Venda'} #{selectedSale?.id}
        </ModalHeader>
        <ModalBody>
          {selectedSale && (
            <div>
              <p><strong>Data:</strong> {new Date(selectedSale.sale_date).toLocaleString('pt-BR')}</p>
              <p><strong>Cliente:</strong> {selectedSale.customer_name || 'Não informado'}</p>
              <p><strong>Operador:</strong> {selectedSale.user_name || 'Não informado'}</p>
              <h5 className="mt-4">Itens</h5>
              <Table bordered>
                <thead>
                  <tr><th>Produto</th><th>Qtd.</th><th>Preço Unit.</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {selectedSale.items?.map(item => (
                    <tr key={item.item_id}>
                      <td>{item.product_name} ({item.color})</td>
                      <td>{item.quantity}</td>
                      <td>R$ {parseFloat(item.unit_price).toFixed(2)}</td>
                      <td>R$ {(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <h5 className="mt-4">Pagamentos</h5>
              <Table bordered>
                <thead>
                  <tr><th>Método</th><th>Valor</th></tr>
                </thead>
                <tbody>
                  {selectedSale.payments?.map(p => (
                    <tr key={p.payment_id}>
                      <td>{p.method}</td>
                      <td>R$ {parseFloat(p.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="text-end">
                <h4>Total: R$ {parseFloat(selectedSale.total_amount).toFixed(2)}</h4>
              </div>
              {selectedSale.sale_type === 'sale' && (
                <div className="mt-4 text-center">
                  <Button color="warning" onClick={handleReturnClick}>
                    <i className="bx bx-undo me-1"></i> Devolver Itens
                  </Button>
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default SalesHistory;
