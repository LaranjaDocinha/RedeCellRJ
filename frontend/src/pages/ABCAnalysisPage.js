import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, FormGroup, Label, Input, Alert, Spinner } from 'reactstrap';
import Chart from 'react-apexcharts';
import { motion } from 'framer-motion';
import useApi from '../hooks/useApi';
import toast from 'react-hot-toast';
import './ABCAnalysisPage.scss';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ABCAnalysisPage = () => {
    const [analysisType, setAnalysisType] = useState('products'); // 'products' or 'customers'
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-01-31');
    const [analysisData, setAnalysisData] = useState([]);

    const { request: fetchProductsABC, isLoading: loadingProductsABC, error: errorProductsABC } = useApi('get');
    const { request: fetchCustomersABC, isLoading: loadingCustomersABC, error: errorCustomersABC } = useApi('get');

    const fetchData = useCallback(async () => {
        setAnalysisData([]); // Clear previous data
        let data = [];
        let error = null;

        if (analysisType === 'products') {
            const response = await fetchProductsABC(`/api/reports/abc-products?startDate=${startDate}&endDate=${endDate}`);
            data = response || [];
            error = errorProductsABC;
        } else {
            const response = await fetchCustomersABC(`/api/reports/abc-customers?startDate=${startDate}&endDate=${endDate}`);
            data = response || [];
            error = errorCustomersABC;
        }

        if (error) {
            toast.error(`Erro ao carregar análise ABC: ${error.message || 'Erro desconhecido'}`);
        } else {
            setAnalysisData(data);
        }
    }, [analysisType, startDate, endDate, fetchProductsABC, fetchCustomersABC, errorProductsABC, errorCustomersABC]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerateReport = () => {
        fetchData(); // Trigger API call with current filters
    };

    const categoryCounts = analysisData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});

    const chartSeries = [
        categoryCounts.A || 0,
        categoryCounts.B || 0,
        categoryCounts.C || 0,
    ];

    const chartOptions = {
        chart: {
            type: 'pie',
            height: 350,
            foreColor: 'var(--text-color)', // For dark mode compatibility
        },
        labels: ['Categoria A', 'Categoria B', 'Categoria C'],
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
        theme: {
            mode: 'light', // Will be dynamically set based on theme context if available
        },
        dataLabels: {
            enabled: true,
            formatter: function (val, opts) {
                return opts.w.config.series[opts.seriesIndex] + " (" + val.toFixed(1) + "%)"
            },
            style: {
                colors: ['#fff']
            }
        },
        legend: {
            labels: {
                colors: 'var(--text-color)', // For dark mode compatibility
            }
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " itens"
                }
            }
        }
    };

    return (
        <motion.div
            className="abc-analysis-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="page-header">
                <h1>Análise ABC</h1>
            </div>

            <Container fluid>
                <Row>
                    <Col lg={12}>
                        {/* Filters Card */}
                        <Card className="filters-card mb-4">
                            {/* ... filters ... */}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        {/* Analysis Table Card */}
                        <Card className="analysis-table-container mb-4">
                            {/* ... table ... */}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        {/* Chart Section Card */}
                        <Card className="chart-section">
                            {/* ... chart ... */}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
};

export default ABCAnalysisPage;
