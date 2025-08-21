import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Spinner, Alert } from 'reactstrap';
import { motion } from 'framer-motion';
import Flatpickr from 'react-flatpickr';
import ReactApexChart from 'react-apexcharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import useApi from '../../hooks/useApi'; // Adjust path as needed
import { useDebounce } from '../../hooks/useDebounce'; // Assuming useDebounce is available

import 'flatpickr/dist/themes/material_blue.css'; // Example theme
import './BIDashboardPage.scss'; // Page-specific styling

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const BIDashboardPage = () => {
  document.title = 'BI Dashboard | PDV Web';

  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-01'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const debouncedFilters = useDebounce(filters, 500);

  const { data: dashboardData, isLoading, error, request } = useApi('get');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const fetchDashboard = useCallback(() => {
    request('/api/bi/dashboard', { params: debouncedFilters });
  }, [request, debouncedFilters]);

  const { kpis, salesTrendChart, profitabilityByCategoryChart, customerDemographicsChart, expenseDistributionChart } = useMemo(() => {
    if (!dashboardData) return {};

    const { summary, salesTrend, profitabilityByCategory, customerDemographics, expenseDistribution } = dashboardData;

    // KPIs
    const kpis = {
      totalSales: summary?.totalSales || 0,
      netProfit: summary?.netProfit || 0,
      totalExpenses: summary?.totalExpenses || 0,
      customerAcquisition: summary?.customerAcquisition || 0,
    };

    // Sales Trend Chart (Line Chart)
    const salesTrendCategories = salesTrend ? salesTrend.map(t => format(new Date(t.date), 'MMM yyyy')) : [];
    const salesTrendSeriesData = salesTrend ? salesTrend.map(t => t.sales) : [];

    const salesTrendChartOptions = {
      chart: { type: 'line', toolbar: { show: true }, foreColor: 'var(--text-color)' },
      xaxis: { categories: salesTrendCategories, title: { text: 'Mês', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      yaxis: { title: { text: 'Vendas (R$)', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      stroke: { curve: 'smooth' },
      tooltip: { x: { format: 'MMM yyyy' }, y: { formatter: val => formatCurrency(val) } },
      dataLabels: { enabled: false },
      theme: { mode: 'light' }, // Placeholder
    };
    const salesTrendChartSeries = [{ name: 'Vendas', data: salesTrendSeriesData }];

    // Profitability by Category Chart (Bar Chart)
    const profitabilityCategories = profitabilityByCategory ? profitabilityByCategory.map(item => item.category) : [];
    const profitabilitySeriesData = profitabilityByCategory ? profitabilityByCategory.map(item => item.profit) : [];

    const profitabilityByCategoryChartOptions = {
      chart: { type: 'bar', toolbar: { show: true }, foreColor: 'var(--text-color)' },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: profitabilityCategories, title: { text: 'Categoria', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      yaxis: { title: { text: 'Lucro (R$)', style: { color: 'var(--text-color)' } }, labels: { style: { colors: 'var(--text-color)' } } },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: val => formatCurrency(val) } },
      theme: { mode: 'light' }, // Placeholder
    };
    const profitabilityByCategoryChartSeries = [{ name: 'Lucro', data: profitabilitySeriesData }];

    // Customer Demographics Chart (Donut Chart)
    const customerDemographicsLabels = customerDemographics ? customerDemographics.map(item => item.segment) : [];
    const customerDemographicsSeriesData = customerDemographics ? customerDemographics.map(item => item.count) : [];

    const customerDemographicsChartOptions = {
      chart: { type: 'donut', foreColor: 'var(--text-color)' },
      labels: customerDemographicsLabels,
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
      theme: { mode: 'light' }, // Placeholder
      legend: { labels: { colors: 'var(--text-color)' } },
      tooltip: { y: { formatter: val => val.toFixed(0) + ' clientes' } },
    };
    const customerDemographicsChartSeries = customerDemographicsSeriesData;

    // Expense Distribution Chart (Pie Chart)
    const expenseDistributionLabels = expenseDistribution ? expenseDistribution.map(item => item.category) : [];
    const expenseDistributionSeriesData = expenseDistribution ? expenseDistribution.map(item => item.amount) : [];

    const expenseDistributionChartOptions = {
      chart: { type: 'pie', foreColor: 'var(--text-color)' },
      labels: expenseDistributionLabels,
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
      theme: { mode: 'light' }, // Placeholder
      legend: { labels: { colors: 'var(--text-color)' } },
      tooltip: { y: { formatter: val => formatCurrency(val) } },
    };
    const expenseDistributionChartSeries = expenseDistributionSeriesData;

    return {
      kpis,
      salesTrendChart: { options: salesTrendChartOptions, series: salesTrendChartSeries },
      profitabilityByCategoryChart: { options: profitabilityByCategoryChartOptions, series: profitabilityByCategoryChartSeries },
      customerDemographicsChart: { options: customerDemographicsChartOptions, series: customerDemographicsChartSeries },
      expenseDistributionChart: { options: expenseDistributionChartOptions, series: expenseDistributionChartSeries },
    };
  }, [dashboardData]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]); // Re-fetch when filters change

  return (
    <motion.div
      className="bi-dashboard-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Row>
          <Col lg={12}>
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
              <h1>BI Dashboard</h1>
              <Button color="primary" onClick={fetchDashboard}>
                <i className="bx bx-refresh me-1"></i> Atualizar Dashboard
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
                      <Label for="startDate">Data Início</Label>
                      <Input
                        type="date"
                        name="startDate"
                        id="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="endDate">Data Fim</Label>
                      <Input
                        type="date"
                        name="endDate"
                        id="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center p-5"><Spinner /> Carregando dashboard...</div>
        ) : error ? (
          <Alert color="danger">Erro ao carregar dashboard: {error.message}</Alert>
        ) : dashboardData && kpis ? (
          <>
            <Row className="mt-4">
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Vendas Totais</CardTitle>
                    <h3 className="display-4">{formatCurrency(kpis.totalSales)}</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Lucro Líquido</CardTitle>
                    <h3 className="text-success">{formatCurrency(kpis.netProfit)}</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Despesas Totais</CardTitle>
                    <h3 className="text-danger">{formatCurrency(kpis.totalExpenses)}</h3>
                  </CardBody>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <CardBody>
                    <CardTitle tag="h5">Aquisição de Clientes</CardTitle>
                    <h3 className="text-info">{kpis.customerAcquisition}</h3>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Tendência de Vendas</CardTitle>
                    {salesTrendChart.series && salesTrendChart.series[0]?.data?.length > 0 ? (
                      <ReactApexChart options={salesTrendChart.options} series={salesTrendChart.series} type="line" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de tendência de vendas.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Lucratividade por Categoria</CardTitle>
                    {profitabilityByCategoryChart.series && profitabilityByCategoryChart.series[0]?.data?.length > 0 ? (
                      <ReactApexChart options={profitabilityByCategoryChart.options} series={profitabilityByCategoryChart.series} type="bar" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de lucratividade por categoria.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Demografia de Clientes</CardTitle>
                    {customerDemographicsChart.series && customerDemographicsChart.series.length > 0 ? (
                      <ReactApexChart options={customerDemographicsChart.options} series={customerDemographicsChart.series} type="donut" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de demografia de clientes.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Distribuição de Despesas</CardTitle>
                    {expenseDistributionChart.series && expenseDistributionChart.series.length > 0 ? (
                      <ReactApexChart options={expenseDistributionChart.options} series={expenseDistributionChart.series} type="pie" height={350} />
                    ) : (
                      <Alert color="info" className="text-center">Dados insuficientes para o gráfico de distribuição de despesas.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Alert color="info" className="text-center">Nenhum dado de dashboard financeiro disponível para o período selecionado.</Alert>
        )}
      </Container>
    </motion.div>
  );
};

export default BIDashboardPage;