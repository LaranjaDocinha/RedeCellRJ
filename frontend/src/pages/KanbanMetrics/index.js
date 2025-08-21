import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import ReactApexChart from 'react-apexcharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available

import 'flatpickr/dist/themes/material_blue.css'; // Example theme
import './KanbanMetrics.scss'; // Page-specific styling

const KanbanMetrics = () => {
  document.title = 'Métricas Kanban | PDV Web';

  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-01'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    technician_id: '',
  });

  const debouncedFilters = useDebounce(filters, 500);

  const { data: metricsData, loading, error, request: fetchMetrics } = useApi('get');
  const { data: techniciansData, loading: loadingTechnicians, error: techniciansError, request: fetchTechnicians } = useApi('get');

  const technicianOptions = techniciansData?.map(t => ({ value: t.id, label: t.name })) || [];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const reFetchMetrics = useCallback(() => {
    fetchMetrics('/api/repairs/kanban-metrics', { params: debouncedFilters });
  }, [fetchMetrics, debouncedFilters]);

  useEffect(() => {
    reFetchMetrics();
  }, [reFetchMetrics]);

  useEffect(() => {
    fetchTechnicians('/api/technicians');
  }, [fetchTechnicians]);

  const { kpis, repairsByStatusChart, completedRepairsByTechnicianChart, avgTimeInStatusChart, cycleTimeTrendChart } = useMemo(() => {
    if (!metricsData) return {};

    const { summary, repairsByStatus, completedRepairsByTechnician, avgTimeInStatus, cycleTimeTrend } = metricsData;

    // KPIs
    const kpis = {
      totalRepairs: summary?.totalRepairs || 0,
      completedRepairs: summary?.completedRepairs || 0,
      avgCycleTime: summary?.avgCycleTime || 0,
      avgLeadTime: summary?.avgLeadTime || 0,
      throughput: summary?.throughput || 0,
    };

    // Repairs by Status Chart (Donut Chart)
    const repairsByStatusLabels = repairsByStatus ? repairsByStatus.map(item => item.status) : [];
    const repairsByStatusSeriesData = repairsByStatus ? repairsByStatus.map(item => item.count) : [];

    const repairsByStatusChartOptions = {
      chart: { type: 'donut', foreColor: 'var(--text-color)' },
      labels: repairsByStatusLabels,
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
      theme: { mode: 'light' }, // Placeholder
      legend: { labels: { colors: 'var(--text-color)' } },
      tooltip: { y: { formatter: val => val.toFixed(0) + ' reparos' } },
    };
    const repairsByStatusChartSeries = repairsByStatusSeriesData;

    // Completed Repairs by Technician Chart (Bar Chart)
    const completedRepairsByTechnicianCategories = completedRepairsByTechnician ? completedRepairsByTechnician.map(item => item.technician_name) : [];
    const completedRepairsByTechnicianSeriesData = completedRepairsByTechnician ? completedRepairsByTechnician.map(item => item.completed_repairs) : [];

    const completedRepairsByTechnicianChartOptions = {
      chart: { type: 'bar', toolbar: { show: true }, foreColor: 'var(--text-color)' },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: completedRepairsByTechnicianCategories, title: { text: 'Técnico', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      yaxis: { title: { text: 'Reparos Concluídos', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: val => val.toFixed(0) + ' reparos' } },
      theme: { mode: 'light' }, // Placeholder
    };
    const completedRepairsByTechnicianChartSeries = [{ name: 'Reparos Concluídos', data: completedRepairsByTechnicianSeriesData }];

    // Average Time in Status Chart (Bar Chart)
    const avgTimeInStatusCategories = avgTimeInStatus ? avgTimeInStatus.map(item => item.status) : [];
    const avgTimeInStatusSeriesData = avgTimeInStatus ? avgTimeInStatus.map(item => item.avg_hours_to_complete) : [];

    const avgTimeInStatusChartOptions = {
      chart: { type: 'bar', toolbar: { show: true }, foreColor: 'var(--text-color)' },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: avgTimeInStatusCategories, title: { text: 'Status', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      yaxis: { title: { text: 'Tempo Médio (horas)', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: val => val.toFixed(2) + ' horas' } },
      theme: { mode: 'light' }, // Placeholder
    };
    const avgTimeInStatusChartSeries = [{ name: 'Tempo Médio', data: avgTimeInStatusSeriesData }];

    // Cycle Time Trend Chart (Line Chart)
    const cycleTimeTrendCategories = cycleTimeTrend ? cycleTimeTrend.map(t => format(new Date(t.date), 'MMM yyyy')) : [];
    const cycleTimeTrendSeriesData = cycleTimeTrend ? cycleTimeTrend.map(t => t.avg_cycle_time) : [];

    const cycleTimeTrendChartOptions = {
      chart: { type: 'line', toolbar: { show: true }, foreColor: 'var(--text-color)' },
      xaxis: { categories: cycleTimeTrendCategories, title: { text: 'Mês', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      yaxis: { title: { text: 'Tempo de Ciclo Médio (horas)', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      stroke: { curve: 'smooth' },
      tooltip: { x: { format: 'MMM yyyy' }, y: { formatter: val => val.toFixed(2) + ' horas' } },
      dataLabels: { enabled: false },
      theme: { mode: 'light' }, // Placeholder
    };
    const cycleTimeTrendChartSeries = [{ name: 'Tempo de Ciclo Médio', data: cycleTimeTrendSeriesData }];

    return {
      kpis,
      repairsByStatusChart: { options: repairsByStatusChartOptions, series: repairsByStatusChartSeries },
      completedRepairsByTechnicianChart: { options: completedRepairsByTechnicianChartOptions, series: completedRepairsByTechnicianChartSeries },
      avgTimeInStatusChart: { options: avgTimeInStatusChartOptions, series: avgTimeInStatusChartSeries },
      cycleTimeTrendChart: { options: cycleTimeTrendChartOptions, series: cycleTimeTrendChartSeries },
    };
  }, [metricsData]);

  return (
    <motion.div
      className="kanban-metrics-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>Métricas Kanban</h1>
              <Button color="primary" onClick={reFetchMetrics}>
                <i className="bx bx-refresh me-1"></i> Atualizar Métricas
              </Button>
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
                        value={[filters.startDate, filters.endDate]}
                        onChange={([start, end]) => {
                          handleFilterChange('startDate', start ? format(start, 'yyyy-MM-dd') : '');
                          handleFilterChange('endDate', end ? format(end, 'yyyy-MM-dd') : '');
                        }}
                        placeholder="Selecione o período"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="technician_id">Técnico:</Label>
                      <Select
                        options={technicianOptions}
                        isLoading={loadingTechnicians}
                        isClearable
                        placeholder="Filtrar por técnico..."
                        onChange={(val) => handleFilterChange('technician_id', val ? val.value : '')}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center p-5"><Spinner /> Carregando métricas Kanban...</div>
        ) : error ? (
          <Alert color="danger">Erro ao carregar métricas Kanban: {error.message}</Alert>
        ) : metricsData && kpis ? (
          <>
            <Row className="mt-4">
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Total de Reparos</CardTitle>
                    <h3 className="display-4">{kpis.totalRepairs}</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Reparos Concluídos</CardTitle>
                    <h3 className="text-success">{kpis.completedRepairs}</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Tempo de Ciclo Médio</CardTitle>
                    <h3 className="text-info">{kpis.avgCycleTime ? kpis.avgCycleTime.toFixed(2) : '0.00'}h</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Throughput</CardTitle>
                    <h3 className="text-primary">{kpis.throughput}</h3>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Reparos por Status</CardTitle>
                    {repairsByStatusChart.series && repairsByStatusChart.series.length > 0 ? (
                      <ReactApexChart options={repairsByStatusChart.options} series={repairsByStatusChart.series} type="donut" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de reparos por status.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Reparos Concluídos por Técnico</CardTitle>
                    {completedRepairsByTechnicianChart.series && completedRepairsByTechnicianChart.series[0]?.data?.length > 0 ? (
                      <ReactApexChart options={completedRepairsByTechnicianChart.options} series={completedRepairsByTechnicianChart.series} type="bar" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de reparos por técnico.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Tempo Médio em Cada Status</CardTitle>
                    {avgTimeInStatusChart.series && avgTimeInStatusChart.series[0]?.data?.length > 0 ? (
                      <ReactApexChart options={avgTimeInStatusChart.options} series={avgTimeInStatusChart.series} type="bar" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de tempo em status.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Tendência do Tempo de Ciclo</CardTitle>
                    {cycleTimeTrendChart.series && cycleTimeTrendChart.series[0]?.data?.length > 0 ? (
                      <ReactApexChart options={cycleTimeTrendChart.options} series={cycleTimeTrendChart.series} type="line" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de tendência do tempo de ciclo.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Alert color="info" className="text-center">Nenhum dado de métricas Kanban disponível para o período selecionado.</Alert>
        )}
      </Container>
    </motion.div>
  );
};

export default KanbanMetrics;