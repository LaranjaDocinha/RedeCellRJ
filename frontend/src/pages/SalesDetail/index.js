import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Row, Col, Card, CardBody, CardTitle, Spinner, Alert, Button, ListGroup, ListGroupItem, Table
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import axios from "axios";
import config from "../../config";

const SalesDetail = () => {
  document.title = "Detalhes da Venda | Skote PDV";

  const { id } = useParams(); // Get sale ID from URL
  const API_URL = config.api.API_URL;

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSaleDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/sales/detail/${id}`);
      setSale(response.data);
    } catch (err) {
      console.error("Erro ao carregar detalhes da venda:", err);
      setError("Erro ao carregar detalhes da venda.");
    } finally {
      setLoading(false);
    }
  }, [id, API_URL]);

  useEffect(() => {
    fetchSaleDetails();
  }, [fetchSaleDetails]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <Breadcrumbs title={"Vendas"} breadcrumbItem={"Detalhes da Venda"} />
            <div className="text-center p-4"><Spinner /> Carregando detalhes da venda...</div>
          </Container>
        </div>
      </React.Fragment>
    );
  }

  if (error) {
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <Breadcrumbs title={"Vendas"} breadcrumbItem={"Detalhes da Venda"} />
            <Alert color="danger">Erro: {error}</Alert>
          </Container>
        </div>
      </React.Fragment>
    );
  }

  if (!sale) {
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <Breadcrumbs title={"Vendas"} breadcrumbItem={"Detalhes da Venda"} />
            <Alert color="info">Venda não encontrada.</Alert>
          </Container>
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title={"Vendas"} breadcrumbItem={`Detalhes da Venda #${sale.id}`} />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CardTitle className="h4 mb-0">Detalhes da Venda #{sale.id}</CardTitle>
                    <Button color="primary" onClick={handlePrint}>
                      <i className="bx bx-printer me-1"></i> Imprimir Recibo
                    </Button>
                  </div>

                  <Row className="mb-3">
                    <Col md={6}>
                      <p><strong>Data da Venda:</strong> {new Date(sale.sale_date).toLocaleString()}</p>
                      <p><strong>Cliente:</strong> {sale.customer_name || 'Não informado'}</p>
                      {sale.customer_email && <p><strong>Email do Cliente:</strong> {sale.customer_email}</p>}
                      {sale.customer_phone && <p><strong>Telefone do Cliente:</strong> {sale.customer_phone}</p>}
                    </Col>
                    <Col md={6}>
                      <p><strong>Vendedor:</strong> {sale.user_name || 'N/A'}</p>
                      <p><strong>Subtotal:</strong> R$ {parseFloat(sale.subtotal).toFixed(2)}</p>
                      <p><strong>Desconto Geral:</strong> {sale.discount_value > 0 ? `${sale.discount_type === 'percentage' ? `${sale.discount_value}%` : `R$ ${parseFloat(sale.discount_value).toFixed(2)}`}` : 'N/A'}</p>
                      <p><strong>Total da Venda:</strong> R$ {parseFloat(sale.total_amount).toFixed(2)}</p>
                    </Col>
                  </Row>

                  <h5 className="mt-4 mb-3">Itens da Venda</h5>
                  <div className="table-responsive mb-4">
                    <Table className="table-bordered table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Cor</th>
                          <th>Código de Barras</th>
                          <th>Qtd</th>
                          <th>Preço Unit.</th>
                          <th>Desconto Item</th>
                          <th>Total Item</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items && sale.items.map(item => (
                          <tr key={item.item_id}>
                            <td>{item.product_name}</td>
                            <td>{item.color}</td>
                            <td>{item.barcode || 'N/A'}</td>
                            <td>{item.quantity}</td>
                            <td>R$ {parseFloat(item.unit_price).toFixed(2)}</td>
                            <td>
                              {item.discount_value > 0 ? (
                                `${item.discount_type === 'percentage' ? `${item.discount_value}%` : `R$ ${parseFloat(item.discount_value).toFixed(2)}`}`
                              ) : 'N/A'}
                            </td>
                            <td>R$ {(item.quantity * (item.unit_price - (item.discount_type === 'percentage' ? item.unit_price * (item.discount_value / 100) : item.discount_value))).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <h5 className="mt-4 mb-3">Pagamentos</h5>
                  <div className="table-responsive">
                    <Table className="table-bordered table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th>Método</th>
                          <th>Valor Pago</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.payments && sale.payments.map(payment => (
                          <tr key={payment.payment_id}>
                            <td>{payment.method}</td>
                            <td>R$ {parseFloat(payment.amount).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {sale.notes && (
                    <>
                      <h5 className="mt-4 mb-3">Observações</h5>
                      <Card className="bg-light">
                        <CardBody>
                          <p className="mb-0">{sale.notes}</p>
                        </CardBody>
                      </Card>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SalesDetail;