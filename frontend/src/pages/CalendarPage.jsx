import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Spinner, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import CalendarView from '../components/Calendar/CalendarView';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi'; // Use useApi directly

import './CalendarPage.scss'; // Page-specific styling

const CalendarPage = () => {
  document.title = 'Calendário | PDV Web';

  const [events, setEvents] = useState([]);
  const { data: fetchedEvents, isLoading, error, request } = useApi('get', '/api/calendar/events'); // Use useApi directly

  const loadEvents = useCallback(async () => {
    // The useApi hook handles loading and error states internally.
    // We just need to trigger the refresh and handle the data once it's available.
    request();
  }, [refresh]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
              <Button color="primary" onClick={loadEvents}>
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