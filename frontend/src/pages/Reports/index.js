import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button } from 'reactstrap';
import { Link } from 'react-router-dom';

const ReportsPage = () => {
  document.title = "Relatórios | PDV Web";

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <h4 className="mb-4">Central de Relatórios</h4>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <Card className="h-100">
              <CardBody className="d-flex flex-column">
                <CardTitle className="h5">Relatório de Vendas</CardTitle>
                <p className="card-text text-muted">Análise detalhada de vendas por período, produto e cliente.</p>
                <Button tag={Link} to="/reports/sales" color="primary" className="mt-auto">Ver Relatório</Button>
              </CardBody>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="h-100">
              <CardBody className="d-flex flex-column">
                <CardTitle className="h5">Relatório de Lucratividade</CardTitle>
                <p className="card-text text-muted">Visão completa sobre a margem de lucro dos seus produtos.</p>
                <Button tag={Link} to="/reports/profitability" color="primary" className="mt-auto">Ver Relatório</Button>
              </CardBody>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="h-100">
              <CardBody className="d-flex flex-column">
                <CardTitle className="h5">Relatório de Clientes</CardTitle>
                <p className="card-text text-muted">Informações sobre seus clientes mais valiosos e hábitos de compra.</p>
                <Button tag={Link} to="/reports/customers" color="primary" className="mt-auto">Ver Relatório</Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReportsPage;
