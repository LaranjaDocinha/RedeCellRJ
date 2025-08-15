import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert, Table, Badge } from 'reactstrap';
import { motion } from 'framer-motion';
import Flatpickr from 'react-flatpickr';
import ReactApexChart from 'react-apexcharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available
import { get } from '../../helpers/api_helper'; // Import get

import 'flatpickr/dist/themes/material_blue.css'; // Example theme
import './NPSReportsPage.scss'; // Page-specific styling

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); // Re-add if not global

const NpsReportsPage = () => {
  document.title = 'Relatórios NPS | PDV Web';

  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const debouncedFilters = useDebounce(filters, 500);

  const { data: npsData, loading, error, request: fetchNpsReports } = useApi(() => get('/api/nps/reports', { params: debouncedFilters }));

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { npsScore, promoterCount, passiveCount, detractorCount, totalResponses, scoreDistributionChart, npsTrendChart, detailedFeedback } = useMemo(() => {
    if (!npsData) return {};

    const { overallNPS, scoreDistribution, trendData, feedback } = npsData;

    // Calculate Promoters, Passives, Detractors
    const promoters = scoreDistribution ? scoreDistribution.filter(s => s.score >= 9).reduce((acc, s) => acc + s.count, 0) : 0;
    const passives = scoreDistribution ? scoreDistribution.filter(s => s.score >= 7 && s.score <= 8).reduce((acc, s) => acc + s.count, 0) : 0;
    const detractors = scoreDistribution ? scoreDistribution.filter(s => s.score <= 6).reduce((acc, s) => acc + s.count, 0) : 0;
    const total = promoters + passives + detractors;

    // Score Distribution Chart
    const scoreCategories = scoreDistribution ? scoreDistribution.map(s => String(s.score)) : [];
    const scoreSeries = scoreDistribution ? scoreDistribution.map(s => s.count) : [];

    const scoreDistributionChartOptions = {
      chart: { type: 'bar', toolbar: { show: false }, foreColor: 'var(--text-color)' },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: scoreCategories, title: { text: 'Score', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      yaxis: { title: { text: 'Número de Respostas', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: function (val) { return val + " respostas" } } },
      theme: { mode: 'light' }, // Placeholder
    };
    const scoreDistributionChartSeries = [{ name: 'Respostas', data: scoreSeries }];

    // NPS Trend Chart
    const trendCategories = trendData ? trendData.map(t => format(new Date(t.date), 'MMM yyyy')) : [];
    const trendSeries = trendData ? trendData.map(t => t.nps) : [];

    const npsTrendChartOptions = {
      chart: { type: 'line', toolbar: { show: true }, foreColor: 'var(--text-color)' },
      xaxis: { categories: trendCategories, title: { text: 'Mês', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      yaxis: { title: { text: 'NPS', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      stroke: { curve: 'smooth' },
      tooltip: { x: { format: 'MMM yyyy' }, y: { formatter: val => val.toFixed(2) } },
      dataLabels: { enabled: false },
      theme: { mode: 'light' }, // Placeholder
    };
    const npsTrendChartSeries = [{ name: 'NPS', data: trendSeries }];

    return {
      npsScore: overallNPS,
      promoterCount: promoters,
      passiveCount: passives,
      detractorCount: detractors,
      totalResponses: total,
      scoreDistributionChart: { options: scoreDistributionChartOptions, series: scoreDistributionChartSeries },
      npsTrendChart: { options: npsTrendChartOptions, series: npsTrendChartSeries },
      detailedFeedback: feedback,
    };
  }, [npsData]);

  useEffect(() => {
    fetchNpsReports();
  }, [debouncedFilters, fetchNpsReports]);

  return (
    <motion.div
      className="nps-reports-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Relatórios NPS</h1>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5" className="mb-4">Filtros</CardTitle>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="dateRange">Período:</Label>
                      <Flatpickr
                        className="form-control d-block"
                        options={{ mode: 'range', dateFormat: 'Y-m-d' }}
                        onChange={([start, end]) => {
                          handleFilterChange('startDate', start ? format(start, 'yyyy-MM-dd') : '');
                          handleFilterChange('endDate', end ? format(end, 'yyyy-MM-dd') : '');
                        }}
                        placeholder="Selecione o período"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center p-5"><Spinner /> Carregando relatórios NPS...</div>
        ) : error ? (
          <Alert color="danger">Erro ao carregar relatórios NPS: {error.message}</Alert>
        ) : npsData && npsData.overallNPS !== undefined ? (
          <>
            <Row className="mt-4">
              <Col md={4}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">NPS Score</CardTitle>
                    <h1 className="display-4">{npsScore !== null ? npsScore.toFixed(0) : 'N/A'}</h1>
                    <p className="text-muted">Baseado em {totalResponses} respostas</p>
                  </CardBody>
                </Card>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={4}>
                    <Card className="text-center">
                      <CardBody>
                        <CardTitle tag="h5">Promotores</CardTitle>
                        <h3 className="text-success">{promoterCount}</h3>
                        <p className="text-muted">({(promoterCount / totalResponses * 100).toFixed(1)}%)</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center">
                      <CardBody>
                        <CardTitle tag="h5">Passivos</CardTitle>
                        <h3 className="text-warning">{passiveCount}</h3>
                        <p className="text-muted">({(passiveCount / totalResponses * 100).toFixed(1)}%)</p>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center">
                      <CardBody>
                        <CardTitle tag="h5">Detratores</CardTitle>
                        <h3 className="text-danger">{detractorCount}</h3>
                        <p className="text-muted">({(detractorCount / totalResponses * 100).toFixed(1)}%)</p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Distribuição de Scores</CardTitle>
                    {scoreDistributionChart.series && scoreDistributionChart.series[0]?.data?.length > 0 ? (
                      <ReactApexChart options={scoreDistributionChart.options} series={scoreDistributionChart.series} type="bar" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de distribuição de scores.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Tendência NPS ao Longo do Tempo</CardTitle>
                    {npsTrendChart.series && npsTrendChart.series[0]?.data?.length > 0 ? (
                      <ReactApexChart options={npsTrendChart.options} series={npsTrendChart.series} type="line" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de tendência NPS.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5" className="mb-4">Feedback Detalhado</CardTitle>
                    {detailedFeedback && detailedFeedback.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="table-hover table-striped mb-0">
                          <thead>
                            <tr>
                              <th>Score</th>
                              <th>Feedback</th>
                              <th>Data</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailedFeedback.map(item => (
                              <tr key={item.id}>
                                <td><Badge color={
                                  item.score >= 9 ? 'success' :
                                  item.score >= 7 && item.score <= 8 ? 'warning' :
                                  'danger'
                                }>{item.score}</Badge></td>
                                <td>{item.feedback || 'N/A'}</td>
                                <td>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert color="info" className="text-center">Nenhum feedback detalhado encontrado.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Alert color="info" className="text-center">Nenhum relatório NPS disponível para o período selecionado.</Alert>
        )}
      </Container>
    </motion.div>
  );
};

export default NpsReportsPage;
