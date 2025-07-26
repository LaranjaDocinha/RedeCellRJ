
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Table, Spinner, Alert } from 'reactstrap';
import axios from 'axios';
import config from '../../config';
import logo from '../../assets/images/logo-dark.png'; // Supondo que o logo esteja aqui

const PrintableRepairOrder = () => {
  const { id } = useParams();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRepairDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${config.api.API_URL}/api/repairs/${id}`);
      setRepair(response.data);
    } catch (err) {
      setError("Falha ao carregar os detalhes da O.S. para impressão.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRepairDetails();
  }, [fetchRepairDetails]);

  useEffect(() => {
    if (!loading && repair) {
      window.print();
    }
  }, [loading, repair]);

  if (loading) return <div className="text-center p-5"><Spinner /> Carregando...</div>;
  if (error) return <Alert color="danger" className="m-5">{error}</Alert>;
  if (!repair) return <Alert color="warning" className="m-5">Ordem de Serviço não encontrada.</Alert>;

  const totalPartsCost = repair.parts.reduce((acc, part) => acc + (part.quantity_used * part.unit_price_at_time), 0);

  return (
    <Container className="p-4" style={{ fontFamily: 'Arial, sans-serif', color: '#000' }}>
      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              background-color: #fff !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
          }
        `}
      </style>
      <Row className="mb-4 align-items-center">
        <Col xs={6}>
          <img src={logo} alt="Logo da Loja" style={{ maxHeight: '60px' }} />
        </Col>
        <Col xs={6} className="text-end">
          <h4 className="mb-0">Ordem de Serviço #{repair.id}</h4>
          <p className="mb-0">Data: {new Date(repair.created_at).toLocaleDateString()}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5>Informações do Cliente</h5>
          <p className="mb-0"><strong>Nome:</strong> {repair.customer_name}</p>
          <p className="mb-0"><strong>Contato:</strong> {repair.customer_phone || repair.customer_email}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5>Informações do Aparelho</h5>
          <p className="mb-0"><strong>Tipo:</strong> {repair.device_type}</p>
          <p className="mb-0"><strong>Marca/Modelo:</strong> {repair.brand} {repair.model}</p>
          <p className="mb-0"><strong>IMEI/Nº de Série:</strong> {repair.imei_serial}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h5>Descrição do Problema Informado pelo Cliente</h5>
          <p style={{ border: '1px solid #ddd', padding: '10px', minHeight: '80px' }}>
            {repair.problem_description}
          </p>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <h5>Serviços e Peças</h5>
          <Table bordered>
            <thead>
              <tr>
                <th>Descrição</th>
                <th className="text-end">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mão de Obra / Serviço</td>
                <td className="text-end">R$ {parseFloat(repair.service_cost).toFixed(2)}</td>
              </tr>
              {repair.parts.map(part => (
                <tr key={part.id}>
                  <td>{part.quantity_used}x {part.product_name}</td>
                  <td className="text-end">R$ {(part.quantity_used * part.unit_price_at_time).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td className="text-end"><strong>Total de Peças:</strong></td>
                <td className="text-end"><strong>R$ {totalPartsCost.toFixed(2)}</strong></td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td className="text-end"><strong>Custo Total (Serviço + Peças):</strong></td>
                <td className="text-end"><strong>R$ {parseFloat(repair.final_cost).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </Table>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h5>Termos e Condições</h5>
          <small className="d-block mb-2">
            1. A garantia para o serviço executado é de 90 dias, cobrindo apenas o defeito reparado.
          </small>
          <small className="d-block mb-2">
            2. Peças trocadas possuem garantia de 90 dias contra defeitos de fabricação. Danos por mau uso, quedas ou contato com líquidos não são cobertos.
          </small>
          <small className="d-block mb-2">
            3. O aparelho deve ser retirado em até 90 dias após a notificação de conclusão. Após este prazo, o mesmo poderá ser vendido para cobrir os custos do reparo.
          </small>
        </Col>
      </Row>

      <Row style={{ marginTop: '80px' }}>
        <Col xs={6} className="text-center">
          <hr className="mx-auto" style={{width: '80%'}} />
          <p className="mb-0">Assinatura do Cliente</p>
        </Col>
        <Col xs={6} className="text-center">
          <hr className="mx-auto" style={{width: '80%'}} />
          <p className="mb-0">Assinatura do Técnico</p>
        </Col>
      </Row>
    </Container>
  );
};

export default PrintableRepairOrder;
