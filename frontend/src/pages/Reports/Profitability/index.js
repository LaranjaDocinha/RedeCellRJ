import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useGlobalFilter } from '../../../context/GlobalFilterContext';
import useApi from '../../../hooks/useApi';

// Components
import ReportKPI from '../components/ReportKPI';
import ProfitabilityTable from './components/ProfitabilityTable';
import ProfitabilityChart from './components/ProfitabilityChart';
import Breadcrumb from '../../../components/Common/Breadcrumb';

const ProfitabilityReport = () => {
  document.title = "Relatório de Lucratividade | PDV Web";
  const { globalPeriod } = useGlobalFilter();

  const { data: reportData, loading, error } = useApi('GET', `/reports/profitability?period=${globalPeriod}`, null, {
    keepPreviousData: true,
  });

  const kpis = [
    { title: "Receita Total", value: reportData?.summary?.totalRevenue, format: 'currency' },
    { title: "Custo dos Produtos", value: reportData?.summary?.totalCost, format: 'currency' },
    { title: "Lucro Bruto", value: reportData?.summary?.grossProfit, format: 'currency' },
    { title: "Margem de Lucro", value: reportData?.summary?.profitMargin, format: 'percentage' },
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="Relatório de Lucratividade" />
        <Row>
          {kpis.map((kpi, index) => (
            <Col key={index} md={3}>
              <ReportKPI {...kpi} loading={loading} />
            </Col>
          ))}
        </Row>
        <Row>
          <Col lg={12}>
            <ProfitabilityChart data={reportData?.profitOverTime} loading={loading} />
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <ProfitabilityTable data={reportData?.products} loading={loading} error={error} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfitabilityReport;
