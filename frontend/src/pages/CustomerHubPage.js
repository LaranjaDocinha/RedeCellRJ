import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, Spinner, Alert, Nav, NavItem, NavLink, TabContent, TabPane, Table, Badge, Button } from 'reactstrap'; // Added Button
import { motion } from 'framer-motion';
import classnames from 'classnames';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi'; // Adjust path as needed

import './CustomerHubPage.scss'; // Page-specific styling

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CustomerHubPage = () => {
  const { customerId } = useParams();
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'sales', 'repairs', 'interactions'

  // Fetch customer details
  const { data: customerDetails, isLoading: loadingCustomer, error: customerError, refresh: refreshCustomerDetails } = useApi('get', `/api/customers/${customerId}`);
  // Fetch sales history
  const { data: salesHistory, isLoading: loadingSales, error: salesError, refresh: refreshSalesHistory } = useApi('get', `/api/sales?customer_id=${customerId}`);
  // Fetch repair history
  const { data: repairHistory, isLoading: loadingRepairs, error: repairsError, refresh: refreshRepairHistory } = useApi('get', `/api/repairs?customer_id=${customerId}`);
  // Fetch customer interactions
  const { data: interactions, isLoading: loadingInteractions, error: interactionsError, refresh: refreshInteractions } = useApi('get', `/api/customer-interactions?customer_id=${customerId}`);

  useEffect(() => {
    refreshCustomerDetails();
    refreshSalesHistory();
    refreshRepairHistory();
    refreshInteractions();
  }, [customerId, refreshCustomerDetails, refreshSalesHistory, refreshRepairHistory, refreshInteractions]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  if (loadingCustomer) {
    return (
      <div className="customer-hub-page text-center p-5">
        <Spinner /> Carregando detalhes do cliente...
      </div>
    );
  }

  if (customerError) {
    return (
      <div className="customer-hub-page text-center p-5">
        <Alert color="danger">Erro ao carregar cliente: {customerError.message}</Alert>
      </div>
    );
  }

  if (!customerDetails) {
    return (
      <div className="customer-hub-page text-center p-5">
        <Alert color="info">Cliente não encontrado.</Alert>
      </div>
    );
  }

  return (
    <motion.div
      className="customer-hub-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header mb-4">
              <h1>Hub do Cliente: {customerDetails.name}</h1>
              <p className="text-muted">Email: {customerDetails.email} | Telefone: {customerDetails.phone}</p>
              <p className="text-muted">Endereço: {customerDetails.address}</p>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'details' })}
                      onClick={() => { toggleTab('details'); }}
                    >
                      Detalhes
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'sales' })}
                      onClick={() => { toggleTab('sales'); }}
                    >
                      Histórico de Vendas
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'repairs' })}
                      onClick={() => { toggleTab('repairs'); }}
                    >
                      Histórico de Reparos
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 'interactions' })}
                      onClick={() => { toggleTab('interactions'); }}
                    >
                      Interações
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab} className="p-3">
                  <TabPane tabId="details">
                    <Row>
                      <Col md={6}>
                        <p><strong>Nome Completo:</strong> {customerDetails.name}</p>
                        <p><strong>Email:</strong> {customerDetails.email}</p>
                        <p><strong>Telefone:</strong> {customerDetails.phone}</p>
                        <p><strong>Endereço:</strong> {customerDetails.address}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>CPF/CNPJ:</strong> {customerDetails.document}</p>
                        <p><strong>Data de Registro:</strong> {new Date(customerDetails.created_at).toLocaleDateString('pt-BR')}</p>
                        {/* Add more customer details here */}
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="sales">
                    <CardTitle tag="h5" className="mb-4">Histórico de Vendas</CardTitle>
                    {loadingSales ? (
                      <div className="text-center"><Spinner /> Carregando vendas...</div>
                    ) : salesError ? (
                      <Alert color="danger">Erro ao carregar vendas: {salesError.message}</Alert>
                    ) : salesHistory && salesHistory.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="table-hover table-striped mb-0">
                          <thead>
                            <tr>
                              <th>ID Venda</th>
                              <th>Data</th>
                              <th>Valor Total</th>
                              <th>Itens</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesHistory.map(sale => (
                              <tr key={sale.id}>
                                <td>{sale.id}</td>
                                <td>{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</td>
                                <td>{formatCurrency(sale.total_amount)}</td>
                                <td>{sale.items.map(item => item.product_name).join(', ')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert color="info" className="text-center">Nenhuma venda encontrada para este cliente.</Alert>
                    )}
                  </TabPane>
                  <TabPane tabId="repairs">
                    <CardTitle tag="h5" className="mb-4">Histórico de Reparos</CardTitle>
                    {loadingRepairs ? (
                      <div className="text-center"><Spinner /> Carregando reparos...</div>
                    ) : repairsError ? (
                      <Alert color="danger">Erro ao carregar reparos: {repairsError.message}</Alert>
                    ) : repairHistory && repairHistory.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="table-hover table-striped mb-0">
                          <thead>
                            <tr>
                              <th>ID Reparo</th>
                              <th>Dispositivo</th>
                              <th>Problema</th>
                              <th>Status</th>
                              <th>Data Entrada</th>
                            </tr>
                          </thead>
                          <tbody>
                            {repairHistory.map(repair => (
                              <tr key={repair.id}>
                                <td>{repair.id}</td>
                                <td>{repair.device_type} - {repair.model}</td>
                                <td>{repair.problem_description}</td>
                                <td><Badge color={
                                  repair.status === 'Pronto para entrega' ? 'success' :
                                  repair.status === 'Em andamento' ? 'warning' :
                                  'secondary'
                                }>{repair.status}</Badge></td>
                                <td>{new Date(repair.start_date).toLocaleDateString('pt-BR')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert color="info" className="text-center">Nenhum reparo encontrado para este cliente.</Alert>
                    )}
                  </TabPane>
                  <TabPane tabId="interactions">
                    <CardTitle tag="h5" className="mb-4">Interações com o Cliente</CardTitle>
                    {loadingInteractions ? (
                      <div className="text-center"><Spinner /> Carregando interações...</div>
                    ) : interactionsError ? (
                      <Alert color="danger">Erro ao carregar interações: {interactionsError.message}</Alert>
                    ) : interactions && interactions.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="table-hover table-striped mb-0">
                          <thead>
                            <tr>
                              <th>Tipo</th>
                              <th>Data</th>
                              <th>Notas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {interactions.map(interaction => (
                              <tr key={interaction.id}>
                                <td><Badge color="primary">{interaction.interaction_type}</Badge></td>
                                <td>{new Date(interaction.interaction_date).toLocaleDateString('pt-BR')}</td>
                                <td>{interaction.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert color="info" className="text-center">Nenhuma interação encontrada para este cliente.</Alert>
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default CustomerHubPage;
