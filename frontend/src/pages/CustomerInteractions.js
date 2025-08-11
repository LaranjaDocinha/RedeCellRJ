import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';

const CustomerInteractions = () => {
  return (
    <Container fluid className="py-3">
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CardTitle tag="h4" className="mb-4">Interações com Clientes</CardTitle>
              <p>Esta é a página de Interações com Clientes. Em breve, você verá a lista de interações aqui.</p>
              {/* Aqui você pode adicionar a lógica para listar e gerenciar as interações */}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerInteractions;
