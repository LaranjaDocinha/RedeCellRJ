import React, { useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'reactstrap';

import { useGlobalFilter } from '../../../context/GlobalFilterContext';
import useApi from '../../../hooks/useApi';

// Components
import ReportKPI from '../components/ReportKPI';
import Breadcrumb from '../../../components/Common/Breadcrumb';

import SalesDetailTable from './components/SalesDetailTable';
import SalesChart from './components/SalesChart';

const SalesReport = () => {
  document.title = 'Relatório de Vendas | PDV Web';
  const { globalPeriod } = useGlobalFilter();

  const {
    data: reportData,
    isLoading: loading,
    error,
    request: fetchReport,
  } = useApi('get');

  const reFetchReport = useCallback(() => {
    fetchReport(`/reports/sales?period=${globalPeriod}`, null, {
      keepPreviousData: true,
    });
  }, [fetchReport, globalPeriod]);

  useEffect(() => {
    reFetchReport();
  }, [reFetchReport]);

  const kpis = [
    { title: 'Receita Total', value: reportData?.summary?.totalRevenue, format: 'currency' },
    { title: 'Total de Vendas', value: reportData?.summary?.totalSales, format: 'number' },
    { title: 'Ticket Médio', value: reportData?.summary?.averageTicket, format: 'currency' },
    { title: 'Produtos Vendidos', value: reportData?.summary?.totalProductsSold, format: 'number' },
  ];

  return (
    <div className='page-content'>
      <Container fluid>
        <Breadcrumb title='Relatório de Vendas' />
        <Row>
          {kpis.map((kpi, index) => (
            <Col key={index} md={3}>
              <ReportKPI {...kpi} loading={loading} />
            </Col>
          ))}
        </Row>
        <Row>
          <Col lg={12}>
            <SalesChart data={reportData?.salesOverTime} loading={loading} />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <SalesDetailTable data={reportData?.sales} error={error} loading={loading} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SalesReport;