import React from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { motion } from 'framer-motion';

const DashboardSkeleton = () => {
  return (
    <div className='page-content'>
      <Container fluid>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <Row className='mb-4 align-items-center'>
            <Col>
              <div className='skeleton-box' style={{ width: '200px', height: '30px' }}></div>
            </Col>
            <Col xs='auto'>
              <div className='skeleton-box' style={{ width: '250px', height: '38px' }}></div>
            </Col>
          </Row>

          {/* Seção de KPIs Skeleton */}
          <Row className='mb-4'>
            {[...Array(4)].map((_, index) => (
              <Col key={index} lg={3} md={6} sm={12}>
                <Card className='dashboard-kpi-card'>
                  <CardBody>
                    <div
                      className='skeleton-box'
                      style={{ width: '80%', height: '20px', marginBottom: '10px' }}
                    ></div>
                    <div className='skeleton-box' style={{ width: '60%', height: '30px' }}></div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Seção de Gráficos Skeleton */}
          <Row>
            <Col lg={6}>
              <Card className='dashboard-chart-card'>
                <CardBody>
                  <div
                    className='skeleton-box'
                    style={{ width: '70%', height: '25px', marginBottom: '20px' }}
                  ></div>
                  <div className='skeleton-box' style={{ width: '100%', height: '250px' }}></div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className='dashboard-chart-card'>
                <CardBody>
                  <div
                    className='skeleton-box'
                    style={{ width: '70%', height: '25px', marginBottom: '20px' }}
                  ></div>
                  <div className='skeleton-box' style={{ width: '100%', height: '250px' }}></div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Seção de Vendas por Método de Pagamento Skeleton */}
          <Row className='mt-4'>
            <Col lg={6}>
              <Card className='dashboard-chart-card'>
                <CardBody>
                  <div
                    className='skeleton-box'
                    style={{ width: '70%', height: '25px', marginBottom: '20px' }}
                  ></div>
                  <div className='skeleton-box' style={{ width: '100%', height: '250px' }}></div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className='dashboard-activity-card'>
                <CardBody>
                  <div
                    className='skeleton-box'
                    style={{ width: '70%', height: '25px', marginBottom: '20px' }}
                  ></div>
                  <div className='skeleton-box' style={{ width: '100%', height: '250px' }}></div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default DashboardSkeleton;
