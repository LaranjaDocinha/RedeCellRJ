import React, { useState, useEffect } from 'react';
// import Chart from 'react-apexcharts'; // Placeholder for ApexCharts
import './BIDashboardPage.scss'; // For page-specific styling

const BIDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState({
        topProducts: [],
        salesByCategory: [],
        salesTrends: [],
        summary: {
            totalSales: 0,
            totalProductsSold: 0,
            totalCustomers: 0,
        },
    });
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-01-31');
    const [interval, setInterval] = useState('month'); // 'day', 'week', 'month', 'year'

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        // Simulate fetching data from various dashboard endpoints
        const fetchDashboardData = async () => {
            // Dummy Top Products
            const dummyTopProducts = [
                { product_name: 'Smartphone X', total_quantity_sold: 150, total_revenue: 15000 },
                { product_name: 'Notebook Pro', total_quantity_sold: 80, total_revenue: 24000 },
                { product_name: 'Fone de Ouvido', total_quantity_sold: 300, total_revenue: 6000 },
            ];

            // Dummy Sales by Category
            const dummySalesByCategory = [
                { category_name: 'Eletrônicos', total_sales_amount: 30000 },
                { category_name: 'Acessórios', total_sales_amount: 8000 },
                { category_name: 'Serviços', total_sales_amount: 10000 },
            ];

            // Dummy Sales Trends
            const dummySalesTrends = [
                { period: '2024-01-01T00:00:00.000Z', total_sales: 5000 },
                { period: '2024-02-01T00:00:00.000Z', total_sales: 7000 },
                { period: '2024-03-01T00:00:00.000Z', total_sales: 6000 },
            ];

            // Dummy Summary
            const dummySummary = {
                totalSales: 48000,
                totalProductsSold: 530,
                totalCustomers: 120,
            };

            setDashboardData({
                topProducts: dummyTopProducts,
                salesByCategory: dummySalesByCategory,
                salesTrends: dummySalesTrends,
                summary: dummySummary,
            });
        };

        fetchDashboardData();
    }, [startDate, endDate, interval]);

    const handleGenerateReport = () => {
        // Trigger API calls with current filters
        console.log('Generating BI Dashboard with:', { startDate, endDate, interval });
    };

    // Chart options and series for Top Products
    const topProductsOptions = {
        chart: { id: 'top-products-chart' },
        xaxis: { categories: dashboardData.topProducts.map(p => p.product_name) },
    };
    const topProductsSeries = [{ name: 'Receita Total', data: dashboardData.topProducts.map(p => p.total_revenue) }];

    // Chart options and series for Sales by Category
    const salesByCategoryOptions = {
        chart: { id: 'sales-by-category-chart' },
        labels: dashboardData.salesByCategory.map(c => c.category_name),
    };
    const salesByCategorySeries = dashboardData.salesByCategory.map(c => c.total_sales_amount);

    // Chart options and series for Sales Trends
    const salesTrendsOptions = {
        chart: { id: 'sales-trends-chart' },
        xaxis: { type: 'datetime', categories: dashboardData.salesTrends.map(t => t.period) },
    };
    const salesTrendsSeries = [{ name: 'Vendas', data: dashboardData.salesTrends.map(t => t.total_sales) }];

    return (
        <div className="bi-dashboard-page">
            <div className="page-header">
                <h1>Dashboard de BI</h1>
            </div>

            <div className="filters-card">
                <div className="form-group">
                    <label htmlFor="startDate">Data de Início:</label>
                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="endDate">Data de Fim:</label>
                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="interval">Intervalo:</label>
                    <select id="interval" value={interval} onChange={(e) => setInterval(e.target.value)}>
                        <option value="day">Diário</option>
                        <option value="week">Semanal</option>
                        <option value="month">Mensal</option>
                        <option value="year">Anual</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={handleGenerateReport}>Atualizar Dashboard</button>
            </div>

            <div className="summary-cards-grid">
                <div className="summary-card">
                    <h3>Total de Vendas</h3>
                    <p className="summary-value">R$ {dashboardData.summary.totalSales.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h3>Produtos Vendidos</h3>
                    <p className="summary-value">{dashboardData.summary.totalProductsSold}</p>
                </div>
                <div className="summary-card">
                    <h3>Clientes Atendidos</h3>
                    <p className="summary-value">{dashboardData.summary.totalCustomers}</p>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h2>Produtos Mais Vendidos</h2>
                    {/* <Chart options={topProductsOptions} series={topProductsSeries} type="bar" height="350" /> */}
                    <p>Gráfico de barras dos produtos com maior receita.</p>
                </div>
                <div className="chart-card">
                    <h2>Vendas por Categoria</h2>
                    {/* <Chart options={salesByCategoryOptions} series={salesByCategorySeries} type="pie" width="400" /> */}
                    <p>Gráfico de pizza da distribuição de vendas por categoria.</p>
                </div>
                <div className="chart-card full-width">
                    <h2>Tendências de Vendas</h2>
                    {/* <Chart options={salesTrendsOptions} series={salesTrendsSeries} type="area" height="350" /> */}
                    <p>Gráfico de área mostrando as vendas ao longo do tempo.</p>
                </div>
            </div>
        </div>
    );
};

export default BIDashboardPage;
