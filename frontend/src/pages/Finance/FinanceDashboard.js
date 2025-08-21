import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Alert, Label, Input, Spinner, Button } from 'reactstrap';
import ReactApexChart from 'react-apexcharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import useApi from '../../hooks/useApi';
import { motion } from 'framer-motion'; // Import motion
import toast from 'react-hot-toast'; // Import toast for error messages

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const FinanceDashboard = () => {
  document.title = 'Dashboard Financeiro | PDV Web';

  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-01'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const { data: dashboardData, isLoading, error, request: fetchDashboard } = useApi('get');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const reFetchDashboard = useCallback(() => {
    fetchDashboard('/api/finance/dashboard', { params: filters });
  }, [fetchDashboard, filters]);

  useEffect(() => {
    reFetchDashboard();
  }, [reFetchDashboard]);

  const { salesByPaymentMethodOptions, salesByPaymentMethodSeries, expensesByCategoryOptions, expensesByCategorySeries, kpis } = useMemo(() => {
    if (!dashboardData) return { salesByPaymentMethodOptions: {}, salesByPaymentMethodSeries: [], expensesByCategoryOptions: {}, expensesByCategorySeries: [], kpis: {} };

    const { kpis, charts } = dashboardData;

    // Sales by Payment Method Chart
    const salesByPaymentMethodOptions = {
      chart: {
        type: 'donut',
        foreColor: 'var(--text-color)', // Dark mode compatibility
      },
      labels: charts.salesByPaymentMethod.map((item) => item.payment_method),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      theme: {
        mode: 'light', // Placeholder, ideally dynamic based on theme context
      },
      legend: {
        labels: {
          colors: 'var(--text-color)', // Dark mode compatibility
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return formatCurrency(val);
          },
        },
      },
    };

    const salesByPaymentMethodSeries = charts.salesByPaymentMethod.map((item) =>
      parseFloat(item.amount),
    );

    // Expenses by Category Chart
    const expensesByCategoryOptions = {
      chart: {
        type: 'bar',
        height: 350,
        foreColor: 'var(--text-color)', // Dark mode compatibility
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: charts.expensesByCategory.map((item) => item.category),
        labels: { style: { colors: 'var(--text-color)' } }, // Dark mode compatibility
      },
      yaxis: {
        title: {
          text: 'R$ (Valor)',
          style: { color: 'var(--text-color)' } // Dark mode compatibility
        },
        labels: { style: { colors: 'var(--text-color)' } }, // Dark mode compatibility
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return formatCurrency(val);
          },
        },
      },
      theme: {
        mode: 'light', // Placeholder, ideally dynamic based on theme context
      },
    };

    const expensesByCategorySeries = [
      {
        name: 'Despesas',
        data: charts.expensesByCategory.map((item) => parseFloat(item.amount)),
      },
    ];

    return {
      salesByPaymentMethodOptions,
      salesByPaymentMethodSeries,
      expensesByCategoryOptions,
      expensesByCategorySeries,
      kpis,
    };
  }, [dashboardData]);

  return (
    <motion.div
      className="finance-dashboard-page" // Added class for styling
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container fluid className="p-4">
        <Breadcrumbs breadcrumbItem='Dashboard' title='Financeiro' />

        <Row className='mb-3'>
          <Col md={3}>
            <Label for='startDate'>Data Início</Label>
            <Input
              id='startDate'
              type='date'
              value={filters.startDate}
              onChange={handleFilterChange}
              name="startDate"
            />
          </Col>
          <Col md={3}>
            <Label for='endDate'>Data Fim</Label>
            <Input
              id='endDate'
              type='date'
              value={filters.endDate}
              onChange={handleFilterChange}
              name="endDate"
            />
          </Col>
          <Col md={6} className="text-end">
            <Button color="primary" onClick={reFetchDashboard}>
              <i className="bx bx-refresh me-1"></i> Atualizar Dados
            </Button>
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center p-5"><Spinner /> Carregando dashboard...</div>
        ) : error ? (
          <Alert color="danger">Erro ao carregar dashboard: {error.message}</Alert>
        ) : dashboardData && kpis ? (
          <>
            <Row>
              <Col md={4}>
                <Card>
                  <CardBody>
                    <CardTitle tag='h5'>Receita Total</CardTitle>
                    <h4 className='mb-0'>{formatCurrency(kpis.totalSales)}</h4>
                  </CardBody>
                </Card>
              </Col>
              <Col md={4}>
                <Card>
                  <CardBody>
                    <CardTitle tag='h5'>Despesa Total</CardTitle>
                    <h4 className='mb-0'>{formatCurrency(kpis.totalExpenses)}</h4>
                  </CardBody>
                </Card>
              </Col>
              <Col md={4}>
                <Card>
                  <CardBody>
                    <CardTitle tag='h5'>Lucro Bruto</CardTitle>
                    <h4 className='mb-0'>{formatCurrency(kpis.grossProfit)}</h4>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag='h5'>Vendas por Método de Pagamento</CardTitle>
                    {salesByPaymentMethodSeries && salesByPaymentMethodSeries.length > 0 ? (
                      <ReactApexChart
                        height={350}
                        options={salesByPaymentMethodOptions}
                        series={salesByPaymentMethodSeries}
                        type='donut'
                      />
                    ) : (
                      <Alert color="info" className="text-center">Nenhum dado de vendas por método de pagamento.</Alert>
                    )}
                  </CardBody>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <CardBody>
                    <CardTitle tag='h5'>Despesas por Categoria</CardTitle>
                    {expensesByCategorySeries && expensesByCategorySeries[0]?.data?.length > 0 ? (
                      <ReactApexChart
                        height={350}
                        options={expensesByCategoryOptions}
                        series={expensesByCategorySeries}
                        type='bar'
                      />
                    ) : (
                      <Alert color="info" className="text-center">Nenhum dado de despesas por categoria.</Alert>
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

export default FinanceDashboard;
