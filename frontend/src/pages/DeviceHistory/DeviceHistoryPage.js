import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert, Table, Badge } from 'reactstrap';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available

import './DeviceHistoryPage.scss'; // Page-specific styling

const DeviceHistoryPage = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const debouncedSerialNumber = useDebounce(serialNumber, 500);

  const { request: fetchDeviceData, isLoading, error } = useApi('get');

  const loadDeviceHistory = useCallback(async () => {
    if (!debouncedSerialNumber) {
      setDeviceDetails(null);
      setDeviceHistory([]);
      setSearchPerformed(false);
      return;
    }
    setSearchPerformed(true);
    try {
      // Assuming API endpoint for device history by serial number
      const response = await fetchDeviceData(`/api/devices?serial_number=${debouncedSerialNumber}`);
      if (response && response.length > 0) {
        setDeviceDetails(response[0]); // Assuming the API returns an array and we take the first match
        // Assuming history is part of the device details or a separate endpoint
        // For now, simulate history data
        const dummyHistory = [
          { id: 1, date: '2023-01-15', type: 'Venda', description: 'Vendido ao Cliente A', details: 'Venda #123' },
          { id: 2, date: '2023-03-01', type: 'Reparo', description: 'Troca de tela', details: 'Reparo #456, Status: Concluído' },
          { id: 3, date: '2023-06-20', type: 'Interação', description: 'Chamada de suporte', details: 'Cliente com dúvida sobre garantia' },
        ];
        setDeviceHistory(dummyHistory); // Replace with actual history from API
      } else {
        setDeviceDetails(null);
        setDeviceHistory([]);
        toast.info('Nenhum dispositivo encontrado com este número de série.');
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao buscar histórico do dispositivo.');
      setDeviceDetails(null);
      setDeviceHistory([]);
    }
  }, [debouncedSerialNumber, fetchDeviceData]);

  useEffect(() => {
    loadDeviceHistory();
  }, [loadDeviceHistory]);

  return (
    <motion.div
      className="device-history-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header mb-4">
              <h1>Histórico do Dispositivo</h1>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Buscar Dispositivo</CardTitle>
                <FormGroup>
                  <Label for="serialNumber">Número de Série / IMEI:</Label>
                  <Input
                    type="text"
                    id="serialNumber"
                    placeholder="Digite o número de série ou IMEI do dispositivo"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                </FormGroup>
                {isLoading && <div className="text-center"><Spinner /> Buscando dispositivo...</div>}
                {error && <Alert color="danger">Erro: {error.message}</Alert>}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {searchPerformed && !isLoading && !error && (
          <Row className="mt-4">
            <Col lg={12}>
              {deviceDetails ? (
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-4">Detalhes do Dispositivo: {deviceDetails.model || 'N/A'}</CardTitle>
                    <Row>
                      <Col md={6}>
                        <p><strong>Tipo:</strong> {deviceDetails.device_type || 'N/A'}</p>
                        <p><strong>Marca:</strong> {deviceDetails.brand || 'N/A'}</p>
                        <p><strong>Modelo:</strong> {deviceDetails.model || 'N/A'}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Número de Série:</strong> {deviceDetails.serial_number || 'N/A'}</p>
                        <p><strong>IMEI:</strong> {deviceDetails.imei || 'N/A'}</p>
                        <p><strong>Status Atual:</strong> <Badge color="info">{deviceDetails.status || 'N/A'}</Badge></p>
                      </Col>
                    </Row>

                    <CardTitle tag="h5" className="mt-4 mb-4">Histórico de Eventos</CardTitle>
                    {deviceHistory && deviceHistory.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="table-hover table-striped mb-0">
                          <thead>
                            <tr>
                              <th>Data</th>
                              <th>Tipo de Evento</th>
                              <th>Descrição</th>
                              <th>Detalhes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deviceHistory.map(event => (
                              <tr key={event.id}>
                                <td>{new Date(event.date).toLocaleDateString('pt-BR')}</td>
                                <td><Badge color="primary">{event.type}</Badge></td>
                                <td>{event.description}</td>
                                <td>{event.details}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert color="info" className="text-center">Nenhum histórico encontrado para este dispositivo.</Alert>
                    )}
                  </CardBody>
                </Card>
              ) : (
                <Alert color="info" className="text-center">Digite um número de série/IMEI para buscar o histórico do dispositivo.</Alert>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </motion.div>
  );
};

export default DeviceHistoryPage;
