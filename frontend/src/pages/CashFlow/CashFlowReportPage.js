import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Alert, Label, Input, Spinner, Table, Badge, Button } from 'reactstrap'; // Added Button
import ReactApexChart from 'react-apexcharts';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import useApi from '../../hooks/useApi';
import { motion } from 'framer-motion'; // Import motion

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const CashFlowReportPage = () => {
  document.title = 'Relatório de Fluxo de Caixa | PDV Web';

  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const { data, isLoading, error, refresh } = useApi('/api/cashflow/report', { params: filters });

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { chartOptions, chartSeries, kpis } = useMemo(() => {
    if (!data?.report) return { chartOptions: {}, chartSeries: [], kpis: {} };

    const reportData = data.report;
    const initialBalance = data.initialBalance || 0;

    const categories = reportData.map(item => formatDate(item.date));
    const seriesData = reportData.map(item => item.balance); // Use raw number for chart

    const totalInflows = reportData.reduce((acc, item) => acc + item.inflows, 0);
    const totalOutflows = reportData.reduce((acc, item) => acc + item.outflows, 0);
    const finalBalance = reportData.length > 0 ? reportData[reportData.length - 1].balance : initialBalance;

    return {
      kpis: {
        initialBalance,
        finalBalance,
        totalInflows,
        totalOutflows,
      },
      chartOptions: {
        chart: { type: 'line', toolbar: { show: true }, foreColor: 'var(--text-color)' }, // Added foreColor
        xaxis: { categories, type: 'datetime', labels: { style: { colors: 'var(--text-color)' } } }, // Added label styling
        yaxis: { title: { text: 'Saldo (R$)', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } }, // Added label styling
        stroke: { curve: 'smooth' },
        tooltip: { x: { format: 'dd/MM/yyyy' }, y: { formatter: val => formatCurrency(val) } },
        dataLabels: { enabled: false },
        theme: {
          mode: 'light', // Placeholder, ideally dynamic based on theme context
        },
      },
      chartSeries: [{ name: 'Saldo Final', data: seriesData }],
    };
  }, [data]);

  return (
    <motion.div
      className="cash-flow-report-page" // Added class for styling
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Breadcrumbs breadcrumbItem="Relatório de Fluxo de Caixa" title="Finanças" />
        
        <Card>
          <CardBody>
            <Row className="mb-3">
              <Col md={3}>
                <Label for="startDate">Data de Início</Label>
                <Input id="startDate" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              </Col>
              <Col md={3}>
                <Label for="endDate">Data de Fim</Label>
                <Input id="endDate" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              </Col>
              <Col md={6} className="text-end">
                <Button color="primary" onClick={refresh}>
                  <i className="bx bx-refresh me-1"></i> Gerar Relatório
                </Button>
              </Col>
            </Row>

            {isLoading ? (
              <div className="text-center p-5"><Spinner /> Carregando relatório...</div>
            ) : error ? (
              <Alert color="danger">Erro ao carregar relatório: {error.message}</Alert>
            ) : data && data.report && data.report.length > 0 ? (
              <>
                <Row>
                  <Col md={3}><KpiCard title="Saldo Inicial" value={formatCurrency(kpis.initialBalance)} /></Col>
                  <Col md={3}><KpiCard title="Total de Entradas" value={formatCurrency(kpis.totalInflows)} className="text-success" /></Col>
                  <Col md={3}><KpiCard title="Total de Saídas" value={formatCurrency(kpis.totalOutflows)} className="text-danger" /></Col>
                  <Col md={3}><KpiCard title="Saldo Final" value={formatCurrency(kpis.finalBalance)} /></Col>
                </Row>

                <Row className="mt-4">
                  <Col>
                    <Card>
                      <CardBody>
                        <CardTitle tag='h5'>Evolução do Saldo</CardTitle>
                        <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} />
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <CardTitle tag='h5'>Extrato Detalhado</CardTitle>
                        <div className="table-responsive">
                            <Table className="table-hover table-striped mb-0"> {/* Added table-striped and mb-0 */}
                                <thead className="table-light">
                                    <tr>
                                        <th>Data</th>
                                        <th>Entradas</th>
                                        <th>Saídas</th>
                                        <th>Saldo do Dia</th>
                                        <th>Saldo Acumulado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.report.map(day => (
                                        <tr key={day.date}>
                                            <td>{formatDate(day.date)}</td>
                                            <td className="text-success">{formatCurrency(day.inflows)}</td>
                                            <td className="text-danger">{formatCurrency(day.outflows)}</td>
                                            <td>{formatCurrency(day.inflows - day.outflows)}</td> {/* Corrected: should be inflows - outflows */}
                                            <td>{formatCurrency(day.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
              </>
            ) : ( // Added else condition for no data
              <Alert color="info" className="text-center">Nenhum dado de fluxo de caixa encontrado para o período selecionado.</Alert>
            )}
          </CardBody>
        </Card>
      </Container>
    </motion.div>
  );
};

const KpiCard = ({ title, value, className = '' }) => (
  <Card>
    <CardBody className="text-center">
      <p className="text-muted mb-2">{title}</p>
      <h4 className={`mb-0 ${className}`}>{value}</h4>
    </CardBody>
  </Card>
);

export default CashFlowReportPage;