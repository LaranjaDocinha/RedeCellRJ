import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardTitle, Spinner, Alert, Badge, Button, Table, Input, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import axios from 'axios';
import config from '../../config';
import classnames from 'classnames';
import AddPartModal from './AddPartModal';
import Timeline from './components/Timeline';
import './components/Timeline.scss';

const RepairDetails = () => {
  const { id } = useParams();
  const isNew = id === 'new';
  document.title = `Detalhes da O.S. #${id} | Skote PDV`;

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addPartModalOpen, setAddPartModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const fetchRepairDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.api.API_URL}/api/repairs/${id}`);
      setRepair(response.data);
    } catch (err) {
      setError("Falha ao carregar os detalhes da O.S.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchRepairDetails();
    } else {
      // Se é um novo reparo, não busca dados e para o loading.
      // Podemos inicializar um objeto 'repair' vazio se necessário.
      setLoading(false);
      setRepair({ /* estrutura inicial para um novo reparo */
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        device_type: '',
        brand: '',
        model: '',
        imei_serial: '',
        problem_description: '',
        status: 'Orçamento pendente',
        parts: [],
        history: [],
        parts_cost: 0,
        service_cost: 0,
        final_cost: 0,
      });
    }
  }, [id, fetchRepairDetails]);

  const handleStatusChange = async (newStatus) => {
    const notes = prompt(`Você está alterando o status para "${newStatus}". Adicione uma observação (opcional):`);
    if (notes === null) return; // Cancelado

    try {
      await axios.patch(`${config.api.API_URL}/api/repairs/${id}/status`, {
        status: newStatus,
        notes: notes
      });
      fetchRepairDetails(); // Recarrega os dados
    } catch (err) {
      alert("Falha ao atualizar o status.");
    }
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      'Orçamento pendente': 'secondary',
      'Aguardando Aprovação': 'info',
      'Em Reparo': 'warning',
      'Pronto para Retirada': 'primary',
      'Finalizado': 'success',
      'Cancelado': 'danger',
    };
    return <Badge color={colorMap[status] || 'light'} className="p-2 font-size-14">{status}</Badge>;
  };

  const availableStatus = [
    'Orçamento pendente', 'Aguardando Aprovação', 'Em Reparo', 
    'Aguardando Peças', 'Pronto para Retirada', 'Finalizado', 'Cancelado'
  ];

  if (loading) return <div className="page-content"><Container fluid><div className="text-center"><Spinner /></div></Container></div>;
  if (error) return <div className="page-content"><Container fluid><Alert color="danger" fade={false}>{error}</Alert></Container></div>;
  if (!repair) return <div className="page-content"><Container fluid><Alert color="warning" fade={false}>Ordem de Serviço não encontrada.</Alert></Container></div>;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Ordens de Serviço" breadcrumbItem={isNew ? "Nova O.S." : `Detalhes da O.S. #${id}`} />
          
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Nav tabs className="nav-tabs-custom nav-justified">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '1' })}
                        onClick={() => toggleTab('1')}
                      >
                        <span className="d-block d-sm-none"><i className="bx bxs-home"></i></span>
                        <span className="d-none d-sm-block">Resumo</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '2' })}
                        onClick={() => toggleTab('2')}
                      >
                        <span className="d-block d-sm-none"><i className="bx bx-user"></i></span>
                        <span className="d-none d-sm-block">Peças e Custos</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '3' })}
                        onClick={() => toggleTab('3')}
                      >
                        <span className="d-block d-sm-none"><i className="bx bx-envelope"></i></span>
                        <span className="d-none d-sm-block">Histórico</span>
                      </NavLink>
                    </NavItem>
                  </Nav>

                  <TabContent activeTab={activeTab} className="p-3 text-muted">
                    <TabPane tabId="1">
                      {/* CONTEÚDO DA ABA RESUMO */}
                      <Row>
                        <Col md={6}>
                          <p><strong>Cliente:</strong> {repair.customer_name}</p>
                          <p><strong>Contato:</strong> {repair.customer_phone || repair.customer_email}</p>
                          <p><strong>Aparelho:</strong> {repair.brand} {repair.model}</p>
                          <p><strong>IMEI/Nº de Série:</strong> {repair.imei_serial}</p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Técnico:</strong> {repair.technician_name || 'Não atribuído'}</p>
                          <p><strong>Data de Abertura:</strong> {repair.created_at ? new Date(repair.created_at).toLocaleString() : 'N/A'}</p>
                          <div className="d-flex align-items-center">
                            <strong className="me-2">Status:</strong>
                            <Input type="select" bsSize="sm" value={repair.status} onChange={e => handleStatusChange(e.target.value)} style={{width: '200px'}}>
                              {availableStatus.map(s => <option key={s} value={s}>{s}</option>)}
                            </Input>
                          </div>
                        </Col>
                      </Row>
                      <hr/>
                      <h5>Descrição do Problema</h5>
                      <p>{repair.problem_description}</p>
                    </TabPane>
                    <TabPane tabId="2">
                      {/* CONTEÚDO DA ABA PEÇAS E CUSTOS */}
                      <Row>
                        <Col>
                          <CardTitle className="d-flex justify-content-between align-items-center mb-4">
                            Peças Utilizadas
                            <Button color="primary" size="sm" onClick={() => setAddPartModalOpen(true)}>
                              <i className="bx bx-plus me-1"></i> Adicionar Peça
                            </Button>
                          </CardTitle>
                          <Table responsive>
                            <thead>
                              <tr><th>Item</th><th>Cor</th><th>Qtd.</th><th>Custo Unit.</th><th>Custo Total</th></tr>
                            </thead>
                            <tbody>
                              {repair.parts.length > 0 ? repair.parts.map(part => (
                                <tr key={part.id}>
                                  <td>{part.product_name}</td>
                                  <td>{part.color}</td>
                                  <td>{part.quantity_used}</td>
                                  <td>R$ {parseFloat(part.unit_price_at_time).toFixed(2)}</td>
                                  <td>R$ {(part.quantity_used * part.unit_price_at_time).toFixed(2)}</td>
                                </tr>
                              )) : (
                                <tr><td colSpan="5" className="text-center">Nenhuma peça utilizada.</td></tr>
                              )}
                            </tbody>
                          </Table>
                          <hr />
                          <div className="d-flex justify-content-between"><span>Custo das Peças:</span> <strong>R$ {parseFloat(repair.parts_cost).toFixed(2)}</strong></div>
                          <div className="d-flex justify-content-between"><span>Custo do Serviço:</span> <strong>R$ {parseFloat(repair.service_cost).toFixed(2)}</strong></div>
                          <hr/>
                          <div className="d-flex justify-content-between h4"><span>Custo Total:</span> <strong>R$ {parseFloat(repair.final_cost).toFixed(2)}</strong></div>
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId="3">
                      {/* CONTEÚDO DA ABA HISTÓRICO */}
                      <CardTitle className="mb-4">Histórico de Status</CardTitle>
                      <ul className="list-unstyled" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {repair.history.map(h => (
                          <li key={h.id} className="mb-3">
                            <div className="d-flex">
                              <div className="me-3">
                                <i className="bx bxs-check-circle text-primary"></i>
                              </div>
                              <div className="flex-grow-1">
                                <div><strong>{h.status_to}</strong></div>
                                <div className="text-muted small">{new Date(h.created_at).toLocaleString()} por {h.user_name}</div>
                                {h.notes && <div className="text-muted small fst-italic">"{h.notes}"</div>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {!isNew && <AddPartModal 
        isOpen={addPartModalOpen}
        toggle={() => setAddPartModalOpen(false)}
        repairId={id}
        onPartAdded={fetchRepairDetails}
      />}
    </React.Fragment>
  );
};

export default RepairDetails;
