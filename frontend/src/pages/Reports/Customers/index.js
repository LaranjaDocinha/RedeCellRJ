import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useGlobalFilter } from '../../../context/GlobalFilterContext';
import useApi from '../../../hooks/useApi';

// Components
import ReportKPI from '../components/ReportKPI';
import TopCustomersTable from './components/TopCustomersTable';
import Breadcrumb from '../../../components/Common/Breadcrumb';

const CustomerReport = () => {
  document.title = "Relatório de Clientes | PDV Web";
  const { globalPeriod } = useGlobalFilter();

  const { data: reportData, loading, error } = useApi('GET', `/reports/customers?period=${globalPeriod}`, null, {
    keepPreviousData: true,
  });

  const kpis = [
    { title: "Clientes Ativos", value: reportData?.summary?.activeCustomers, format: 'number' },
    { title: "Novos Clientes", value: reportData?.summary?.newCustomers, format: 'number' },
    { title: "Total Gasto por Cliente (Média)", value: reportData?.summary?.averageSpentPerCustomer, format: 'currency' },
    { title: "Total de Compras (Média)", value: reportData?.summary?.averagePurchasesPerCustomer, format: 'number' },
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="Relatório de Clientes" />
        <Row>
          {kpis.map((kpi, index) => (
            <Col key={index} md={3}>
              <ReportKPI {...kpi} loading={loading} />
            </Col>
          ))}
        </Row>
        <Row>
          <Col lg={12}>
            <TopCustomersTable data={reportData?.topCustomers} loading={loading} error={error} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CustomerReport;
