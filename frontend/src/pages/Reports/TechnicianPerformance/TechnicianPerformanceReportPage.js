import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, CardTitle, Form, FormGroup, Label, Input } from 'reactstrap';
import { motion } from 'framer-motion';
import DateRangePicker from '../../../components/Common/DateRangePicker';
import PerformanceSummaryCard from '../../../components/Reports/PerformanceSummaryCard';
import TechnicianPerformanceChart from '../../../components/Reports/TechnicianPerformanceChart';
import AdvancedTable from '../../../components/Common/AdvancedTable';
import { useAuthStore } from '../../../store/authStore'; // Assuming auth store for token
import { formatCurrency } from '../../../utils/formatters'; // Assuming a formatter utility
import { toast } from 'react-toastify'; // For notifications

const TechnicianPerformanceReportPage = () => {
  const { token } = useAuthStore();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  // Fetch technicians for the filter dropdown
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/technicians`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch technicians');
        }
        const data = await response.json();
        setTechnicians(data);
      } catch (err) {
        console.error('Error fetching technicians:', err);
        toast.error('Erro ao carregar técnicos.');
      }
    };
    fetchTechnicians();
  }, [token]);

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
          ...(selectedTechnician && { technicianId: selectedTechnician }),
        }).toString();

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reports/technician-performance?${params}`, {
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
        console.error('Error fetching technician performance report:', err);
        setError(err.message);
        toast.error(`Erro: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate, selectedTechnician, token]);

  // Prepare data for summary cards
  const totalRepairs = useMemo(() => reportData.reduce((sum, tech) => sum + parseInt(tech.total_repairs || 0), 0), [reportData]);
  const totalRevenue = useMemo(() => reportData.reduce((sum, tech) => sum + parseFloat(tech.total_revenue || 0), 0), [reportData]);
  const averageRepairTimeOverall = useMemo(() => {
    const totalTime = reportData.reduce((sum, tech) => sum + parseFloat(tech.average_repair_time_minutes || 0) * parseInt(tech.total_repairs || 0), 0);
    const totalCompletedRepairs = reportData.reduce((sum, tech) => sum + parseInt(tech.total_repairs || 0), 0);
    return totalCompletedRepairs > 0 ? (totalTime / totalCompletedRepairs).toFixed(0) : 0;
  }, [reportData]);

  // Prepare data for chart
  const chartCategories = useMemo(() => reportData.map(tech => tech.technician_name), [reportData]);
  const chartSeriesRepairs = useMemo(() => [{
    name: 'Total de Reparos',
    data: reportData.map(tech => parseInt(tech.total_repairs || 0))
  }], [reportData]);
  const chartSeriesRevenue = useMemo(() => [{
    name: 'Faturamento (R$)',
    data: reportData.map(tech => parseFloat(tech.total_revenue || 0))
  }], [reportData]);
  const chartSeriesAvgTime = useMemo(() => [{
    name: 'Tempo Médio (min)',
    data: reportData.map(tech => parseFloat(tech.average_repair_time_minutes || 0))
  }], [reportData]);

  // Prepare data for detailed table
  const tableColumns = useMemo(() => [
    { Header: 'Técnico', accessor: 'technician_name' },
    { Header: 'Total de Reparos', accessor: 'total_repairs' },
    { Header: 'Faturamento Total', accessor: 'total_revenue', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Tempo Médio (min)', accessor: 'average_repair_time_minutes', Cell: ({ value }) => `${parseFloat(value).toFixed(0)} min` },
  ], []);

  return (
    <Container fluid className="py-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4">Relatório de Desempenho de Técnicos</h2>

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
          <Col md="4">
            <FormGroup>
              <Label for="technicianSelect">Técnico</Label>
              <Input
                type="select"
                name="technicianSelect"
                id="technicianSelect"
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
              >
                <option value="">Todos os Técnicos</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </Input>
            </FormGroup>
          </Col>
        </Row>

        {loading ? (
          <p>Carregando dados do relatório...</p>
        ) : error ? (
          <p className="text-danger">Erro ao carregar relatório: {error}</p>
        ) : (
          <>
            <Row className="mb-4">
              <Col md="4">
                <PerformanceSummaryCard
                  title="Total de Reparos"
                  value={totalRepairs}
                  iconClass="bx-wrench"
                  animationDelay={0}
                />
              </Col>
              <Col md="4">
                <PerformanceSummaryCard
                  title="Faturamento Total"
                  value={formatCurrency(totalRevenue)}
                  iconClass="bx-dollar"
                  animationDelay={0.1}
                />
              </Col>
              <Col md="4">
                <PerformanceSummaryCard
                  title="Tempo Médio de Reparo"
                  value={`${averageRepairTimeOverall} min`}
                  iconClass="bx-time"
                  animationDelay={0.2}
                />
              </Col>
            </Row>

            <Row className="mb-4">
              <Col lg="6">
                <TechnicianPerformanceChart
                  title="Reparos por Técnico"
                  series={chartSeriesRepairs}
                  categories={chartCategories}
                  type="bar"
                  animationDelay={0.3}
                />
              </Col>
              <Col lg="6">
                <TechnicianPerformanceChart
                  title="Faturamento por Técnico"
                  series={chartSeriesRevenue}
                  categories={chartCategories}
                  type="line"
                  animationDelay={0.4}
                />
              </Col>
            </Row>

            <Row className="mb-4">
              <Col lg="12">
                <Card>
                  <CardHeader>
                    <CardTitle tag="h5" className="mb-0">Detalhes de Desempenho</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <AdvancedTable
                      columns={tableColumns}
                      data={reportData}
                      enablePagination={true}
                      enableSearch={true}
                      searchPlaceholder="Buscar técnico..."
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

export default TechnicianPerformanceReportPage;