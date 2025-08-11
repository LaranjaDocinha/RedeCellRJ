import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Input, Button, Table } from 'reactstrap';
import ReactApexChart from 'react-apexcharts';
import { motion, AnimatePresence } from 'framer-motion'; // Para animações sutis e transições

import Breadcrumb from '../../components/Common/Breadcrumb'; // Importar Breadcrumb
import './PainelAdministrativo.scss'; // Importa o SCSS para estilização

const PainelAdministrativo = () => {
  // Dados de exemplo para os KPIs
  const kpis = [
    { title: 'Ordens em Aberto', value: 45, icon: 'bx-wrench' },
    { title: 'Prontos para Entrega', value: 12, icon: 'bx-package' },
    { title: 'Lucro do Mês', value: 'R$ 15.230,00', icon: 'bx-dollar' },
    { title: 'Clientes Atendidos', value: 187, icon: 'bx-group' },
  ];

  // Dados de exemplo para o gráfico de serviços
  const serviceData = [
    { name: 'Troca de Tela', count: 120 },
    { name: 'Troca de Bateria', count: 80 },
    { name: 'Reparo de Software', count: 50 },
    { name: 'Limpeza', count: 30 },
    { name: 'Outros', count: 25 },
  ];

  // Dados de exemplo para o gráfico de faturamento
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Fev', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Abr', revenue: 2780 },
    { name: 'Mai', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  const charts = [
    {
      title: 'Tipos de Serviços Mais Realizados',
      component: (
        <ReactApexChart
          height={300}
          options={{
            chart: { type: 'donut', foreColor: 'var(--color-body-text)' },
            labels: serviceData.map((s) => s.name),
            colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'], // Exemplo de cores
            legend: { position: 'bottom', labels: { colors: 'var(--color-body-text)' } },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: { width: 200 },
                  legend: { position: 'bottom' },
                },
              },
            ],
          }}
          series={serviceData.map((s) => s.count)}
          type='donut'
        />
      ),
    },
    {
      title: 'Faturamento Mensal',
      component: (
        <ReactApexChart
          height={300}
          options={{
            chart: {
              type: 'line',
              toolbar: { show: false },
              foreColor: 'var(--color-body-text)',
            },
            xaxis: {
              categories: revenueData.map((item) => item.name),
              labels: { style: { colors: 'var(--color-text-muted)' } },
            },
            stroke: {
              curve: 'smooth',
            },
            colors: ['#28a745'], // Cor da linha
            legend: { labels: { colors: 'var(--color-body-text)' } },
          }}
          series={[
            {
              name: 'Faturamento',
              data: revenueData.map((item) => item.revenue),
            },
          ]}
          type='line'
        />
      ),
    },
  ];

  const [chartIndex, setChartIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setChartIndex((prevIndex) => (prevIndex + 1) % charts.length);
  //   }, 10000); // Troca a cada 10 segundos
  //   return () => clearInterval(interval);
  // }, [charts.length]);

  // Dados de exemplo para as últimas ordens de serviço
  const recentOrders = [
    {
      id: 'OS001',
      client: 'João Silva',
      device: 'iPhone 12',
      status: 'Em Andamento',
      date: '2024-07-25',
    },
    {
      id: 'OS002',
      client: 'Maria Souza',
      device: 'Samsung S21',
      status: 'Pronto',
      date: '2024-07-24',
    },
    {
      id: 'OS003',
      client: 'Carlos Lima',
      device: 'Xiaomi Redmi',
      status: 'Aguardando Peça',
      date: '2024-07-23',
    },
    {
      id: 'OS004',
      client: 'Ana Paula',
      device: 'Motorola G9',
      status: 'Finalizado',
      date: '2024-07-22',
    },
  ];

  return (
    <div className='admin-dashboard'>
      <Container fluid>
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumb breadcrumbItem='Painel Administrativo' />

          {/* Seção de KPIs */}
          <Row className='kpi-section'>
            {kpis.map((kpi, index) => (
              <Col key={index} className='mb-4' lg='3' md='6' sm='12'>
                <Card className='kpi-card shadow-sm'>
                  <CardBody>
                    <div className='d-flex align-items-center'>
                      <div className='kpi-icon me-3'>
                        <i className={`bx ${kpi.icon}`}></i>
                      </div>
                      <div>
                        <h5 className='kpi-title text-muted text-uppercase mb-0'>{kpi.title}</h5>
                        <h3 className='kpi-value mb-0'>{kpi.value}</h3>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Seção de Gráfico e Busca Rápida */}
          <Row className='chart-search-section mb-4'>
            <Col className='mb-4' lg='8'>
              <Card className='shadow-sm h-100'>
                <CardBody>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={chartIndex}
                      animate={{ opacity: 1, x: 0 }}
                      className='chart-carousel-container'
                      exit={{ opacity: 0, x: -50 }}
                      initial={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h5 className='card-title'>{charts[chartIndex].title}</h5>
                      {charts[chartIndex].component}
                      <div className='chart-pagination'>
                        {charts.map((_, index) => (
                          <button
                            key={index}
                            aria-label={`Ir para o gráfico ${index + 1}`}
                            className={`dot ${index === chartIndex ? 'active' : ''}`}
                            style={{ background: 'none', border: 'none', padding: 0 }}
                            type='button'
                            onClick={() => setChartIndex(index)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </CardBody>
              </Card>
            </Col>
            <Col className='mb-4' lg='4'>
              <Card className='shadow-sm h-100'>
                <CardBody>
                  <h5 className='card-title'>Busca Rápida</h5>
                  <Input className='mb-3' placeholder='Buscar por cliente ou OS...' type='text' />
                  <Button block color='primary'>
                    Buscar
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Lista das Últimas Ordens de Serviço */}
          <Row className='recent-orders-section'>
            <Col lg='12'>
              <Card className='shadow-sm'>
                <CardBody>
                  <h5 className='card-title'>Últimas Ordens de Serviço</h5>
                  <div className='table-responsive'>
                    <Table hover className='mb-0'>
                      <thead>
                        <tr>
                          <th>OS #</th>
                          <th>Cliente</th>
                          <th>Aparelho</th>
                          <th>Status</th>
                          <th>Data de Entrada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.client}</td>
                            <td>{order.device}</td>
                            <td>
                              <span
                                className={`status-badge status-${order.status.toLowerCase().replace(/\s/g, '-')}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td>{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default PainelAdministrativo;
