import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, FormGroup, Label, Input, Button } from 'reactstrap';
import Chart from 'react-apexcharts'; // Import ApexCharts
import { get } from '../helpers/api_helper'; // Assuming api_helper has a get method
import { useApi } from '../hooks/useApi'; // Assuming useApi hook exists
import toast from 'react-hot-toast'; // For notifications
import Select from 'react-select'; // For technician dropdown
import DatePicker from 'react-datepicker'; // For date range picker
import 'react-datepicker/dist/react-datepicker.css'; // Datepicker styles
import './TechnicianPerformanceReportPage.scss'; // For page-specific styling

const TechnicianPerformanceReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState(null); // Use object for react-select
    const [technicians, setTechnicians] = useState([]); // List of technicians for dropdown
    const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1))); // Default to 1 year ago
    const [endDate, setEndDate] = useState(new Date()); // Default to today

    const { loading, error, request: fetchReport } = useApi('get');
    const { request: fetchTechnicians } = useApi('get');

    // Fetch list of technicians
    useEffect(() => {
        const loadTechnicians = async () => {
            try {
                const response = await fetchTechnicians('/api/technicians');
                const options = response.map(tech => ({ value: tech.id, label: tech.name }));
                setTechnicians(options);
            } catch (err) {
                toast.error('Erro ao carregar técnicos.');
                console.error('Error loading technicians:', err);
            }
        };
        loadTechnicians();
    }, [fetchTechnicians]);

    const generateReport = useCallback(async () => {
        if (!selectedTechnician || !startDate || !endDate) {
            toast.error('Por favor, selecione um técnico e um período.');
            return;
        }

        try {
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            const params = {
                technicianId: selectedTechnician.value,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
            };
            const response = await fetchReport('/api/reports/technician-performance', params);
            setReportData(response);
        } catch (err) {
            toast.error('Erro ao gerar relatório de desempenho do técnico.');
            console.error('Error generating report:', err);
            setReportData(null);
        }
    }, [selectedTechnician, startDate, endDate, fetchReport]);

    // Initial report generation on component mount or when technician/dates change
    useEffect(() => {
        generateReport();
    }, [generateReport]);

    return (
        <div className="page-content">
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <CardTitle className="h4 mb-4">Relatório de Desempenho do Técnico</CardTitle>
                                <Row className="mb-4">
                                    <Col md={4}>
                                        <FormGroup>
                                            <Label htmlFor="technicianSelect">Técnico:</Label>
                                            <Select
                                                id="technicianSelect"
                                                options={technicians}
                                                value={selectedTechnician}
                                                onChange={setSelectedTechnician}
                                                placeholder="Selecione um técnico"
                                                isClearable
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label htmlFor="startDatePicker">Data de Início:</Label>
                                            <DatePicker
                                                id="startDatePicker"
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                dateFormat="dd/MM/yyyy"
                                                className="form-control"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={3}>
                                        <FormGroup>
                                            <Label htmlFor="endDatePicker">Data de Fim:</Label>
                                            <DatePicker
                                                id="endDatePicker"
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                dateFormat="dd/MM/yyyy"
                                                className="form-control"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={2} className="d-flex align-items-end">
                                        <Button color="primary" onClick={generateReport} disabled={!selectedTechnician || loading}>
                                            {loading ? 'Gerando...' : 'Gerar Relatório'}
                                        </Button>
                                    </Col>
                                </Row>

                                {loading && <p>Carregando dados do relatório...</p>}
                                {error && <p className="text-danger">Erro: {error.message}</p>}

                                {reportData && !loading && !error ? (
                                    <>
                                        <Row className="mb-4">
                                            <Col md={3}>
                                                <Card className="mini-stats-wid">
                                                    <CardBody>
                                                        <div className="d-flex">
                                                            <div className="flex-grow-1">
                                                                <p className="text-muted fw-medium">Total de Reparos</p>
                                                                <h4 className="mb-0">{reportData.total_repairs}</h4>
                                                            </div>
                                                            <div className="flex-shrink-0 align-self-center">
                                                                <div className="mini-stat-icon avatar-sm rounded-circle bg-primary">
                                                                    <span className="avatar-title">
                                                                        <i className="bx bx-wrench font-size-24"></i>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="mini-stats-wid">
                                                    <CardBody>
                                                        <div className="d-flex">
                                                            <div className="flex-grow-1">
                                                                <p className="text-muted fw-medium">Reparos Concluídos</p>
                                                                <h4 className="mb-0">{reportData.completed_repairs}</h4>
                                                            </div>
                                                            <div className="flex-shrink-0 align-self-center">
                                                                <div className="mini-stat-icon avatar-sm rounded-circle bg-success">
                                                                    <span className="avatar-title">
                                                                        <i className="bx bx-check-double font-size-24"></i>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="mini-stats-wid">
                                                    <CardBody>
                                                        <div className="d-flex">
                                                            <div className="flex-grow-1">
                                                                <p className="text-muted fw-medium">Receita Total</p>
                                                                <h4 className="mb-0">R$ {reportData.total_revenue_from_repairs ? reportData.total_revenue_from_repairs.toFixed(2) : '0.00'}</h4>
                                                            </div>
                                                            <div className="flex-shrink-0 align-self-center">
                                                                <div className="mini-stat-icon avatar-sm rounded-circle bg-warning">
                                                                    <span className="avatar-title">
                                                                        <i className="bx bx-dollar font-size-24"></i>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="mini-stats-wid">
                                                    <CardBody>
                                                        <div className="d-flex">
                                                            <div className="flex-grow-1">
                                                                <p className="text-muted fw-medium">Tempo Médio (dias)</p>
                                                                <h4 className="mb-0">{reportData.average_repair_time_days}</h4>
                                                            </div>
                                                            <div className="flex-shrink-0 align-self-center">
                                                                <div className="mini-stat-icon avatar-sm rounded-circle bg-info">
                                                                    <span className="avatar-title">
                                                                        <i className="bx bx-time font-size-24"></i>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col lg={6}>
                                                <Card>
                                                    <CardBody>
                                                        <CardTitle className="h4 mb-4">Reparos por Status</CardTitle>
                                                        {reportData.repairs_by_status && Object.keys(reportData.repairs_by_status).length > 0 ? (
                                                            <Chart
                                                                options={{
                                                                    labels: Object.keys(reportData.repairs_by_status),
                                                                    responsive: [{
                                                                        breakpoint: 480,
                                                                        options: {
                                                                            chart: {
                                                                                width: 200
                                                                            },
                                                                            legend: {
                                                                                position: 'bottom'
                                                                            }
                                                                        }
                                                                    }],
                                                                    legend: {
                                                                        position: 'bottom'
                                                                    }
                                                                }}
                                                                series={Object.values(reportData.repairs_by_status)}
                                                                type="donut"
                                                                height="300"
                                                            />
                                                        ) : (
                                                            <p className="text-muted">Nenhum dado de status de reparo disponível para o período.</p>
                                                        )}
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            {/* Add more charts here, e.g., repairs over time, revenue over time */}
                                        </Row>

                                        <Row>
                                            <Col lg={12}>
                                                <Card>
                                                    <CardBody>
                                                        <CardTitle className="h4 mb-4">Detalhes dos Reparos</CardTitle>
                                                        <div className="table-responsive">
                                                            <table className="table table-striped table-bordered mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>ID</th>
                                                                        <th>Status</th>
                                                                        <th>Data Criação</th>
                                                                        <th>Custo Final</th>
                                                                        <th>Descrição do Problema</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {reportData.details && reportData.details.length > 0 ? (
                                                                        reportData.details.map(repair => (
                                                                            <tr key={repair.id}>
                                                                                <td>{repair.id}</td>
                                                                                <td>{repair.status}</td>
                                                                                <td>{new Date(repair.created_at).toLocaleDateString()}</td>
                                                                                <td>R$ {repair.final_cost ? repair.final_cost.toFixed(2) : '0.00'}</td>
                                                                                <td>{repair.problem_description}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="5" className="text-center">Nenhum reparo encontrado para o período selecionado.</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </>
                                ) : (
                                    !loading && !error && <p className="empty-state text-center">Selecione um técnico e um período para gerar o relatório.</p>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TechnicianPerformanceReportPage;
