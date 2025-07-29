import React from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';

import Breadcrumbs from '../../components/Common/Breadcrumb';

const FinanceDashboard = () => {
  document.title = 'Financeiro | RedeCellRJ PDV';

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Dashboard' title='Financeiro' />
          <Row>
            <Col lg='12'>
              <Card>
                <CardBody>
                  <h4 className='card-title mb-4'>Dashboard Financeiro</h4>
                  <p>
                    Esta página servirá como o painel principal para a gestão financeira. Links para
                    Contas a Pagar, Contas a Receber, e outros relatórios serão adicionados aqui.
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FinanceDashboard;
