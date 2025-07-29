import React from 'react';
import { Container, Row, Col, Card, CardBody, Input, Button, Table } from 'reactstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion'; // Para animações sutis
import './AdminDashboard.scss'; // Importa o SCSS para estilização

const AdminDashboard = () => {
  // Dados de exemplo para os KPIs
  const kpis = [
    { title: 'Ordens em Aberto', value: 45, icon: '🛠️' },
    { title: 'Prontos para Entrega', value: 12, icon: '📦' },
    { title: 'Lucro do Mês', value: 'R$ 15.230,00', icon: '💰' },
    { title: 'Clientes Atendidos', value: 187, icon: '👥' },
  ];

  // Dados de exemplo para o gráfico de serviços
  const serviceData = [
    { name: 'Troca de Tela', count: 120 },
    { name: 'Troca de Bateria', count: 80 },
    { name: 'Reparo de Software', count: 50 },
    { name: 'Limpeza', count: 30 },
    { name: 'Outros', count: 25 },
  ];

  // Dados de exemplo para as últimas ordens de serviço
  const recentOrders = [
    { id: 'OS001', client: 'João Silva', device: 'iPhone 12', status: 'Em Andamento', date: '2024-07-25' },
    { id: 'OS002', client: 'Maria Souza', device: 'Samsung S21', status: 'Pronto', date: '2024-07-24' },
    { id: 'OS003', client: 'Carlos Lima', device: 'Xiaomi Redmi', status: 'Aguardando Peça', date: '2024-07-23' },
    { id: 'OS004', client: 'Ana Paula', device: 'Motorola G9', status: 'Finalizado', date: '2024-07-22' },
  ];

  return (
    <div className="admin-dashboard">
      <Container fluid className="main-content">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="dashboard-title">Dashboard Administrativo</h2>

          {/* Seção de KPIs */}
          <Row className="kpi-section">
            {kpis.map((kpi, index) => (
              <Col key={index} lg="3" md="6" sm="12" className="mb-4">
                <Card className="kpi-card shadow-sm">
                  <CardBody>
                    <div className="d-flex align-items-center">
                      <div className="kpi-icon me-3">{kpi.icon}</div>
                      <div>
                        <h5 className="kpi-title text-muted text-uppercase mb-0">{kpi.title}</h5>
                        <h3 className="kpi-value mb-0">{kpi.value}</h3>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Seção de Gráfico e Busca Rápida */}
          <Row className="chart-search-section mb-4">
            <Col lg="8" className="mb-4">
              <Card className="shadow-sm h-100">
                <CardBody>
                  <h5 className="card-title">Tipos de Serviços Mais Realizados</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#007bff" name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4" className="mb-4">
              <Card className="shadow-sm h-100">
                <CardBody>
                  <h5 className="card-title">Busca Rápida</h5>
                  <Input
                    type="text"
                    placeholder="Buscar por cliente ou OS..."
                    className="mb-3"
                  />
                  <Button color="primary" block>Buscar</Button>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Lista das Últimas Ordens de Serviço */}
          <Row className="recent-orders-section">
            <Col lg="12">
              <Card className="shadow-sm">
                <CardBody>
                  <h5 className="card-title">Últimas Ordens de Serviço</h5>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
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
                            <td><span className={`status-badge status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>{order.status}</span></td>
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

export default AdminDashboard;
