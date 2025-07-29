import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import { motion } from 'framer-motion';

import DateRangePicker from '../../components/Common/DateRangePicker';
import { useDashboard } from '../../context/DashboardContext';

// Importar os novos componentes de gráfico
import MonthlySalesChart from './components/charts/MonthlySalesChart';
import TopProductsChart from './components/charts/TopProductsChart';
import SalesByPaymentMethodChart from './components/charts/SalesByPaymentMethodChart';
import DashboardSkeleton from './components/DashboardSkeleton';
import RecentActivityFeed from './components/RecentActivityFeed';

const DashboardV2 = () => {
  const { loading, dashboardData, startDate, endDate, setDateRange } = useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { kpis, widgets } = dashboardData;

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
              <h4 className='mb-0'>Visão Geral do Dashboard</h4>
            </Col>
            <Col xs='auto'>
              <DateRangePicker
                initialEndDate={endDate}
                initialStartDate={startDate}
                onDateChange={setDateRange}
              />
            </Col>
          </Row>

          {/* Seção de KPIs */}
          <Row className='mb-4'>
            <Col lg={3} md={6} sm={12}>
              <Card className='dashboard-kpi-card'>
                <CardBody>
                  <CardTitle className='h6 text-muted'>Vendas Hoje</CardTitle>
                  <h3 className='mb-0'>
                    R$ {kpis?.todaySales?.toFixed(2) || '0.00'}
                    {kpis?.todaySalesTrend !== undefined && (
                      <span
                        className={`font-size-12 ms-2 ${kpis.todaySalesTrend >= 0 ? 'text-success' : 'text-danger'}`}
                      >
                        {kpis.todaySalesTrend >= 0 ? (
                          <i className='bx bx-up-arrow-alt'></i>
                        ) : (
                          <i className='bx bx-down-arrow-alt'></i>
                        )}
                        {Math.abs(kpis.todaySalesTrend).toFixed(2)}%
                      </span>
                    )}
                  </h3>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Card className='dashboard-kpi-card'>
                <CardBody>
                  <CardTitle className='h6 text-muted'>Lucro Mês</CardTitle>
                  <h3 className='mb-0'>
                    R$ {kpis?.monthlyProfit?.toFixed(2) || '0.00'}
                    {kpis?.monthlyProfitTrend !== undefined && (
                      <span
                        className={`font-size-12 ms-2 ${kpis.monthlyProfitTrend >= 0 ? 'text-success' : 'text-danger'}`}
                      >
                        {kpis.monthlyProfitTrend >= 0 ? (
                          <i className='bx bx-up-arrow-alt'></i>
                        ) : (
                          <i className='bx bx-down-arrow-alt'></i>
                        )}
                        {Math.abs(kpis.monthlyProfitTrend).toFixed(2)}%
                      </span>
                    )}
                  </h3>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Card className='dashboard-kpi-card'>
                <CardBody>
                  <CardTitle className='h6 text-muted'>Novos Clientes</CardTitle>
                  <h3 className='mb-0'>{kpis?.newCustomers || 0}</h3>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6} sm={12}>
              <Card className='dashboard-kpi-card'>
                <CardBody>
                  <CardTitle className='h6 text-muted'>Estoque Baixo</CardTitle>
                  <h3 className='mb-0'>{kpis?.lowStockItems || 0} Itens</h3>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Seção de Gráficos */}
          <Row>
            <Col lg={6}>
              <Card className='dashboard-chart-card'>
                <CardBody>
                  <CardTitle className='h5'>Vendas Mensais</CardTitle>
                  <MonthlySalesChart data={widgets?.monthlySales} />
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className='dashboard-chart-card'>
                <CardBody>
                  <CardTitle className='h5'>Produtos Mais Vendidos</CardTitle>
                  <TopProductsChart data={widgets?.topProducts} />
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Seção de Vendas por Método de Pagamento */}
          <Row className='mt-4'>
            <Col lg={6}>
              <Card className='dashboard-chart-card'>
                <CardBody>
                  <CardTitle className='h5'>Vendas por Método de Pagamento</CardTitle>
                  <SalesByPaymentMethodChart data={widgets?.salesByPayment} />
                </CardBody>
              </Card>
            </Col>
            {/* Placeholder para outros widgets ou atividades recentes */}
            <Col lg={6}>
              <RecentActivityFeed activities={widgets?.recentActivity} />
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default DashboardV2;
