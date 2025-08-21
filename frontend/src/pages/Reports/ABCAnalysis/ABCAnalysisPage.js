import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, CardTitle, FormGroup, Label } from 'reactstrap';
import { motion } from 'framer-motion';
import DateRangePicker from '../../../components/Common/DateRangePicker';
import ABCSummary from '../../../components/Reports/ABCSummary';
import ABCChart from '../../../components/Reports/ABCChart';
import AdvancedTable from '../../../components/Common/AdvancedTable';
import { useAuthStore } from '../../../store/authStore'; // Assuming auth store for token
import { toast } from 'react-toastify'; // For notifications

const ABCAnalysisPage = () => {
  const { token } = useAuthStore();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      if (!startDate || !endDate) return;

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }).toString();

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reports/abc-products?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch report data');
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching ABC analysis report:', err);
        setError(err.message);
        toast.error(`Erro: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate, token]);

  // Prepare data for summary cards
  const classAProducts = useMemo(() => reportData.filter(item => item.category === 'A').length, [reportData]);
  const classBProducts = useMemo(() => reportData.filter(item => item.category === 'B').length, [reportData]);
  const classCProducts = useMemo(() => reportData.filter(item => item.category === 'C').length, [reportData]);
  const totalProductsAnalyzed = useMemo(() => reportData.length, [reportData]);

  // Prepare data for detailed table
  const tableColumns = useMemo(() => [
    { Header: 'ID do Produto', accessor: 'product_id' },
    { Header: 'Nome do Produto', accessor: 'product_name' },
    { Header: 'Faturamento Total', accessor: 'total_revenue', Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}` },
    { Header: 'Faturamento Acumulado', accessor: 'cumulative_revenue', Cell: ({ value }) => `R$ ${parseFloat(value).toFixed(2)}` },
    { Header: 'Percentual Acumulado (%)', accessor: 'cumulative_percentage', Cell: ({ value }) => `${parseFloat(value).toFixed(2)}%` },
    { Header: 'Classe ABC', accessor: 'category' },
  ], []);

  return (
    <Container fluid className="py-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4">Análise ABC de Produtos</h2>

        <Row className="mb-4">
          <Col md="4">
            <FormGroup>
              <Label for="dateRange">Período</Label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={(date) => setDateRange([date, endDate])}
                setEndDate={(date) => setDateRange([startDate, date])}
              />
            </FormGroup>
          </Col>
        </Row>

        {loading ? (
          <p>Carregando dados da análise ABC...</p>
        ) : error ? (
          <p className="text-danger">Erro ao carregar análise ABC: {error}</p>
        ) : (
          <>
            <Row className="mb-4">
              <Col md="3">
                <ABCSummary
                  title="Produtos Classe A"
                  value={classAProducts}
                  iconClass="bx-star"
                  animationDelay={0}
                />
              </Col>
              <Col md="3">
                <ABCSummary
                  title="Produtos Classe B"
                  value={classBProducts}
                  iconClass="bx-award"
                  animationDelay={0.1}
                />
              </Col>
              <Col md="3">
                <ABCSummary
                  title="Produtos Classe C"
                  value={classCProducts}
                  iconClass="bx-leaf"
                  animationDelay={0.2}
                />
              </Col>
              <Col md="3">
                <ABCSummary
                  title="Total Analisado"
                  value={totalProductsAnalyzed}
                  iconClass="bx-package"
                  animationDelay={0.3}
                />
              </Col>
            </Row>

            <Row className="mb-4">
              <Col lg="12">
                <ABCChart
                  title="Curva ABC de Faturamento"
                  data={reportData}
                  animationDelay={0.4}
                />
              </Col>
            </Row>

            <Row className="mb-4">
              <Col lg="12">
                <Card>
                  <CardHeader>
                    <CardTitle tag="h5" className="mb-0">Detalhes da Análise ABC</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <AdvancedTable
                      columns={tableColumns}
                      data={reportData}
                      enablePagination={true}
                      enableSearch={true}
                      searchPlaceholder="Buscar produto..."
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </motion.div>
    </Container>
  );
};

export default ABCAnalysisPage;