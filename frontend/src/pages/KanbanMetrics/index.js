import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, Row, Col, Alert } from 'reactstrap';
import Chart from 'react-apexcharts';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import useApi from '../../hooks/useApi';
import { get } from '../../helpers/api_helper';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const KanbanMetrics = () => {
  document.title = 'Métricas Kanban | RedeCellRJ PDV';

  const [cycleTimeData, setCycleTimeData] = useState([]);
  const [cfdData, setCfdData] = useState({ cfdData: [], allStatuses: [] });

  const { request: fetchCycleTime, loading: loadingCycleTime, error: errorCycleTime } = useApi(get);
  const { request: fetchCFD, loading: loadingCFD, error: errorCFD } = useApi(get);

  useEffect(() => {
    const getMetrics = async () => {
      try {
        const cycleTimeResponse = await fetchCycleTime('/api/repairs/metrics/cycle-time');
        setCycleTimeData(cycleTimeResponse);

        const cfdResponse = await fetchCFD('/api/repairs/metrics/cfd');
        setCfdData(cfdResponse);
      } catch (err) {
        console.error('Erro ao buscar métricas:', err);
      }
    };
    getMetrics();
  }, [fetchCycleTime, fetchCFD]);

  // Cycle Time Chart Options
  const cycleTimeOptions = {
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
      categories: cycleTimeData.map((data) => `OS #${data.repair_id}`),
      title: {
        text: 'Ordem de Serviço',
      },
    },
    yaxis: {
      title: {
        text: 'Tempo de Ciclo (dias)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + ' dias';
        },
      },
    },
  };

  const cycleTimeSeries = [
    {
      name: 'Tempo de Ciclo',
      data: cycleTimeData.map((data) => data.cycle_time_days),
    },
  ];

  // CFD Chart Options
  const cfdOptions = {
    chart: {
      type: 'area',
      height: 350,
      stacked: true,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      type: 'datetime',
      categories: cfdData.cfdData.map((data) => new Date(data.date).getTime()),
      title: {
        text: 'Data',
      },
    },
    yaxis: {
      title: {
        text: 'Número de Reparos',
      },
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy',
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.8,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
  };

  const cfdSeries = cfdData.allStatuses.map((status) => ({
    name: status,
    data: cfdData.cfdData.map((data) => data[status] || 0),
  }));

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs breadcrumbItem='Métricas' title='Kanban' />
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <h4 className='card-title mb-4'>Tempo de Ciclo dos Reparos</h4>
                  {loadingCycleTime ? (
                    <LoadingSpinner />
                  ) : errorCycleTime ? (
                    <Alert color='danger'>
                      Erro ao carregar dados de Tempo de Ciclo: {errorCycleTime.message}
                    </Alert>
                  ) : (
                    <Chart
                      height={350}
                      options={cycleTimeOptions}
                      series={cycleTimeSeries}
                      type='bar'
                    />
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col lg={12}>
              <Card>
                <CardBody>
                  <h4 className='card-title mb-4'>Diagrama de Fluxo Cumulativo (CFD)</h4>
                  {loadingCFD ? (
                    <LoadingSpinner />
                  ) : errorCFD ? (
                    <Alert color='danger'>Erro ao carregar dados de CFD: {errorCFD.message}</Alert>
                  ) : (
                    <Chart height={350} options={cfdOptions} series={cfdSeries} type='area' />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default KanbanMetrics;
