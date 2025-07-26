import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, Alert, Button, ButtonGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import ApexCharts from 'react-apexcharts';
import config from "../../config";

const DashboardCustom = () => {
  document.title = "Dashboard | Skote PDV";

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today'); // today, last7days, thisMonth

  const fetchSummaryData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.api.API_URL}/api/dashboard/summary?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSummaryData(data);
    } catch (err) {
      toast.error("Falha ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const chartOptions = {
    options: {
      chart: {
        type: 'bar',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: summaryData?.salesByHour?.map(d => `${d.hour}:00`) || [],
      },
      yaxis: {
        title: { text: 'R$ (vendas)' }
      },
      fill: { opacity: 1 },
      tooltip: {
        y: {
          formatter: function (val) {
            return "R$ " + val.toFixed(2)
          }
        }
      }
    },
    series: [{
      name: 'Vendas',
      data: summaryData?.salesByHour?.map(d => parseFloat(d.total_sales).toFixed(2)) || []
    }],
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="align-items-center mb-4">
            <Col md={8}>
              <h4 className="mb-0">Dashboard da Loja</h4>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <ButtonGroup>
                <Button color="primary" outline={period !== 'today'} onClick={() => setPeriod('today')}>Hoje</Button>
                <Button color="primary" outline={period !== 'last7days'} onClick={() => setPeriod('last7days')}>7 Dias</Button>
                <Button color="primary" outline={period !== 'thisMonth'} onClick={() => setPeriod('thisMonth')}>Este Mês</Button>
              </ButtonGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center"><i className="bx bx-loader-alt bx-spin font-size-24"></i></div>
          ) : !summaryData ? (
            <Alert color="danger">Não foi possível carregar os dados do dashboard.</Alert>
          ) : (
            <>
              <Row>
                {/* Cards de Resumo */}
                <Col md={3}>
                  <Card className="mini-stats-wid">
                    <CardBody>
                      <Link to="/sales-history" className="text-reset">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <p className="text-muted fw-medium">Vendas ({period === 'today' ? 'Hoje' : (period === 'last7days' ? '7 Dias' : 'Mês')})</p>
                            <h4 className="mb-0">R$ {parseFloat(summaryData.totalRevenue || 0).toFixed(2)}</h4>
                          </div>
                          <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
                            <span className="avatar-title"><i className="bx bx-dollar-circle font-size-24"></i></span>
                          </div>
                        </div>
                      </Link>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="mini-stats-wid">
                    <CardBody>
                      <Link to="/customers" className="text-reset">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <p className="text-muted fw-medium">Novos Clientes</p>
                            <h4 className="mb-0">{summaryData.newCustomers}</h4>
                          </div>
                          <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
                            <span className="avatar-title"><i className="bx bx-user-plus font-size-24"></i></span>
                          </div>
                        </div>
                      </Link>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="mini-stats-wid">
                    <CardBody>
                      <Link to="/repairs" className="text-reset">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <p className="text-muted fw-medium">Novas O.S.</p>
                            <h4 className="mb-0">{summaryData.newRepairs}</h4>
                          </div>
                          <div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
                            <span className="avatar-title"><i className="bx bx-wrench font-size-24"></i></span>
                          </div>
                        </div>
                      </Link>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="mini-stats-wid">
                    <CardBody>
                      <Link to="/stock-management" className="text-reset">
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <p className="text-muted fw-medium">Baixo Estoque</p>
                            <h4 className="mb-0">{summaryData.lowStockItems}</h4>
                          </div>
                          <div className="mini-stat-icon avatar-sm rounded-circle bg-danger align-self-center">
                            <span className="avatar-title"><i className="bx bx-error-circle font-size-24"></i></span>
                          </div>
                        </div>
                      </Link>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col lg={8}>
                  <Card>
                    <CardBody>
                      <CardTitle className="h4 mb-4">Vendas por Hora</CardTitle>
                      <ApexCharts options={chartOptions.options} series={chartOptions.series} type="bar" height={350} />
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4}>
                  <Card>
                    <CardBody>
                      <CardTitle className="h4 mb-4">Top 5 Produtos Vendidos</CardTitle>
                      <ul className="list-group list-group-flush">
                        {summaryData.topSellingProducts?.map(p => (
                          <li key={p.product_id} className="list-group-item d-flex justify-content-between">
                            <span>{p.product_name}</span>
                            <Badge color="primary" pill>{p.total_quantity} vendidos</Badge>
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  )
}

export default DashboardCustom
