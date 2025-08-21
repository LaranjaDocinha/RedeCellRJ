import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import CalendarView from '../components/Calendar/CalendarView';
import { get } from '../helpers/api_helper';
import useApi from '../hooks/useApi';

import './CalendarPage.scss'; // Page-specific styling

const CalendarPage = () => {
  document.title = 'Calendário | PDV Web';

  const [events, setEvents] = useState([]);

  // Define a função de fetch de forma estável com useCallback
  const fetchEvents = useCallback(() => {
    const startDate = new Date();
    const endDate = new Date();
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return get(`/api/calendar/events?start=${start}&end=${end}`);
  }, []); // O array de dependências vazio garante que a função não seja recriada

  const { data: fetchedEvents, isLoading, error, request } = useApi(fetchEvents);

  // O useEffect agora chama a função `request` do hook, que é estável
  useEffect(() => {
    request();
  }, [request]); // A função `request` do useApi é garantidamente estável

  useEffect(() => {
    if (fetchedEvents) {
      setEvents(fetchedEvents);
    }
  }, [fetchedEvents]);

  return (
    <motion.div
      className="calendar-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Calendário de Atividades</h1>
              <Button color="primary" onClick={request}>
                <i className="bx bx-refresh me-1"></i> Atualizar Calendário
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Eventos</CardTitle>
                {isLoading ? (
                  <div className="text-center"><Spinner /> Carregando eventos...</div>
                ) : error ? (
                  <Alert color="danger">Erro ao carregar eventos: {error.message}</Alert>
                ) : events && events.length > 0 ? (
                  <CalendarView events={events} />
                ) : (
                  <Alert color="info" className="text-center">Nenhum evento encontrado para o período.</Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default CalendarPage;