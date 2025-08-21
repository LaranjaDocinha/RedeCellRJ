
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Card, CardBody, Table, Spinner, Alert, Button } from 'reactstrap';
import { get } from '../../helpers/api_helper';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CashierHistory = () => {
  document.title = 'Histórico de Caixa | RedeCellRJ PDV';

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [sessionSales, setSessionSales] = useState({});
  const [salesLoading, setSalesLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get('/api/cashier/history');
      setHistory(data);
    } catch (error) {
      toast.error('Falha ao carregar histórico de caixa.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessionSales = useCallback(async (sessionId) => {
    setSalesLoading(true);
    try {
      const data = await get(`/api/sales?sessionId=${sessionId}`);
      setSessionSales(prev => ({ ...prev, [sessionId]: data }));
    } catch (error) {
      toast.error('Falha ao carregar vendas da sessão.');
      console.error(error);
    } finally {
      setSalesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggleExpand = (sessionId) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
      if (!sessionSales[sessionId]) {
        fetchSessionSales(sessionId);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-content d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner>Carregando histórico...</Spinner>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <CardBody>
            <h4 className="card-title mb-4">Histórico de Caixa</h4>
            {history.length === 0 ? (
              <Alert color="info">Nenhum histórico de caixa encontrado.</Alert>
            ) : (
              <Table className="table-nowrap mb-0" responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Abertura</th>
                    <th>Fechamento</th>
                    <th>Valor Inicial</th>
                    <th>Valor Final</th>
                    <th>Diferença</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((session) => (
                    <React.Fragment key={session.id}>
                      <tr onClick={() => toggleExpand(session.id)} style={{ cursor: 'pointer' }}>
                        <td>{session.id}</td>
                        <td>{new Date(session.opening_time).toLocaleString()}</td>
                        <td>{session.closing_time ? new Date(session.closing_time).toLocaleString() : '-'}</td>
                        <td>R$ {parseFloat(session.initial_amount).toFixed(2).replace('.', ',')}</td>
                        <td>{session.final_amount ? `R$ ${parseFloat(session.final_amount).toFixed(2).replace('.', ',')}` : '-'}</td>
                        <td className={session.difference > 0 ? 'text-success' : session.difference < 0 ? 'text-danger' : ''}>
                          {session.difference ? `R$ ${parseFloat(session.difference).toFixed(2).replace('.', ',')}` : '-'}
                        </td>
                        <td>
                          <Button size="sm" color="info" onClick={(e) => { e.stopPropagation(); toggleExpand(session.id); }}>
                            {expandedSessionId === session.id ? 'Esconder' : 'Ver Vendas'}
                          </Button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedSessionId === session.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan="7">
                              {salesLoading ? (
                                <div className="text-center py-3"><Spinner>Carregando vendas...</Spinner></div>
                              ) : sessionSales[session.id] && sessionSales[session.id].length > 0 ? (
                                <Table size="sm" className="mt-2 mb-0">
                                  <thead>
                                    <tr>
                                      <th>Venda ID</th>
                                      <th>Data</th>
                                      <th>Total</th>
                                      <th>Cliente</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sessionSales[session.id].map(sale => (
                                      <tr key={sale.id}>
                                        <td>{sale.id}</td>
                                        <td>{new Date(sale.sale_date).toLocaleString()}</td>
                                        <td>R$ {parseFloat(sale.total_amount).toFixed(2).replace('.', ',')}</td>
                                        <td>{sale.customer_name || 'N/A'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <Alert color="warning" className="text-center mt-2 mb-0">Nenhuma venda encontrada para esta sessão.</Alert>
                              )}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default CashierHistory;
