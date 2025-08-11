import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Alert, Label, Input } from 'reactstrap';
import ReactApexChart from 'react-apexcharts';
import { format } from 'date-fns';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import useApi from '../../hooks/useApi';
import { get } from '../../helpers/api_helper';
import useNotification from '../../hooks/useNotification';

const FinanceDashboard = () => {
  document.title = 'Dashboard Financeiro | PDV Web';
  const { showSuccess, showError } = useNotification();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { request: fetchDashboardData } = useApi(get);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { startDate, endDate };
      const response = await fetchDashboardData('/api/finance/dashboard', { params });
      setDashboardData(response);
    } catch (err) {
      showError('Falha ao carregar dados do dashboard financeiro.');
      console.error(err);
      setError('Falha ao carregar dados do dashboard financeiro.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className='page-content'>
        <Container fluid>
          <LoadingSpinner />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className='page-content'>
        <Container fluid>
          <Alert color='danger'>{error}</Alert>
        </Container>
      </div>
    );
  }

  const salesByPaymentMethodOptions = {
    chart: {
      type: 'donut',
    },
    labels: dashboardData.charts.salesByPaymentMethod.map((item) => item.payment_method),
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
  };

  const salesByPaymentMethodSeries = dashboardData.charts.salesByPaymentMethod.map((item) =>
    parseFloat(item.amount),
  );

  const expensesByCategoryOptions = {
    chart: {
      type: 'bar',
      height: 350,
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
      categories: dashboardData.charts.expensesByCategory.map((item) => item.category),
    },
    yaxis: {
      title: {
        text: 'R$ (Valor)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return 'R$ ' + val.toFixed(2);
        },
      },
    },
  };

  const expensesByCategorySeries = [
    {
      name: 'Despesas',
      data: dashboardData.charts.expensesByCategory.map((item) => parseFloat(item.amount)),
    },
  ];

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Dashboard' title='Financeiro' />

          <Row className='mb-3'>
            <Col md={3}>
              <Label for='startDate'>Data Início</Label>
              <Input
                id='startDate'
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Label for='endDate'>Data Fim</Label>
              <Input
                id='endDate'
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Card>
                <CardBody>
                  <CardTitle className='h5'>Receita Total</CardTitle>
                  <h4 className='mb-0'>R$ {dashboardData.kpis.totalSales.toFixed(2)}</h4>
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <CardBody>
                  <CardTitle className='h5'>Despesa Total</CardTitle>
                  <h4 className='mb-0'>R$ {dashboardData.kpis.totalExpenses.toFixed(2)}</h4>
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <CardBody>
                  <CardTitle className='h5'>Lucro Bruto</CardTitle>
                  <h4 className='mb-0'>R$ {dashboardData.kpis.grossProfit.toFixed(2)}</h4>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card>
                <CardBody>
                  <CardTitle className='h5'>Vendas por Método de Pagamento</CardTitle>
                  <ReactApexChart
                    height={350}
                    options={salesByPaymentMethodOptions}
                    series={salesByPaymentMethodSeries}
                    type='donut'
                  />
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <CardBody>
                  <CardTitle className='h5'>Despesas por Categoria</CardTitle>
                  <ReactApexChart
                    height={350}
                    options={expensesByCategoryOptions}
                    series={expensesByCategorySeries}
                    type='bar'
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FinanceDashboard;
