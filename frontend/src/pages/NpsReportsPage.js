import React, { useState, useEffect } from 'react';
// import Chart from 'react-apexcharts'; // Placeholder for ApexCharts
import './NpsReportsPage.scss'; // For page-specific styling

const NpsReportsPage = () => {
    const [npsData, setNpsData] = useState({
        npsScore: 0,
        totalResponses: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
    });

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        // In a real application, you'd fetch data from /api/nps-surveys/calculate-nps
        // For now, using dummy data
        setNpsData({
            npsScore: 40, // Example: (2 Promoters - 1 Detractor) / 5 Total * 100
            totalResponses: 50,
            promoters: 25, // 50%
            passives: 15,  // 30%
            detractors: 10, // 20%
        });
    }, []);

    // Placeholder for chart options and series for NPS distribution
    const npsDistributionOptions = {
        chart: {
            id: 'nps-distribution-chart',
        },
        labels: ['Promotores (9-10)', 'Passivos (7-8)', 'Detratores (0-6)'],
        colors: ['#28a745', '#ffc107', '#dc3545'], // Green, Yellow, Red
        legend: {
            position: 'bottom',
        },
    };
    const npsDistributionSeries = [npsData.promoters, npsData.passives, npsData.detractors];

    return (
        <div className="nps-reports-page">
            <div className="page-header">
                <h1>Relatórios NPS</h1>
            </div>

            <div className="nps-summary-card">
                <h2>Pontuação NPS Geral</h2>
                <div className="nps-score-display">
                    <span className="score-value">{npsData.npsScore}</span>
                    <span className="score-label">NPS</span>
                </div>
                <p className="total-responses">Baseado em {npsData.totalResponses} respostas</p>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Promotores</h3>
                    <p className="metric-value">{npsData.promoters}</p>
                    <p className="metric-description">Clientes que deram nota 9 ou 10.</p>
                </div>
                <div className="metric-card">
                    <h3>Passivos</h3>
                    <p className="metric-value">{npsData.passives}</p>
                    <p className="metric-description">Clientes que deram nota 7 ou 8.</p>
                </div>
                <div className="metric-card">
                    <h3>Detratores</h3>
                    <p className="metric-value">{npsData.detractors}</p>
                    <p className="metric-description">Clientes que deram nota de 0 a 6.</p>
                </div>
            </div>

            <div className="nps-chart-section">
                <h2>Distribuição de Respostas</h2>
                {/* <Chart options={npsDistributionOptions} series={npsDistributionSeries} type="pie" width="450" /> */}
                <p>Gráfico de pizza mostrando a proporção de promotores, passivos e detratores.</p>
            </div>
        </div>
    );
};

export default NpsReportsPage;
