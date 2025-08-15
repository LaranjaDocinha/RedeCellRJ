import React, { useState, useEffect } from 'react';
import './ProductProfitabilityReportPage.scss'; // For page-specific styling

const ProductProfitabilityReportPage = () => {
    const [reportData, setReportData] = useState([]);
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-01-31');
    const [productId, setProductId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        // Simulate fetching data from /api/reports/product-profitability
        const dummyData = [
            { product_id: 1, product_name: 'Smartphone X', barcode: '12345', total_quantity_sold: 50, total_revenue: 5000, total_cost: 2000, gross_profit: 3000, profit_margin_percentage: 60 },
            { product_id: 2, product_name: 'Capa para Celular', barcode: '67890', total_quantity_sold: 100, total_revenue: 1000, total_cost: 300, gross_profit: 700, profit_margin_percentage: 70 },
        ];
        setReportData(dummyData);
    }, [startDate, endDate, productId, categoryId]);

    const handleGenerateReport = () => {
        // Trigger API call with current filters
        console.log('Generating product profitability report with:', { startDate, endDate, productId, categoryId });
    };

    return (
        <div className="product-profitability-report-page">
            <div className="page-header">
                <h1>Relatório de Lucratividade por Produto</h1>
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
                    <label htmlFor="productId">ID do Produto:</label>
                    <input type="text" id="productId" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Opcional" />
                </div>
                <div className="form-group">
                    <label htmlFor="categoryId">ID da Categoria:</label>
                    <input type="text" id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="Opcional" />
                </div>
                <button className="btn btn-primary" onClick={handleGenerateReport}>Gerar Relatório</button>
            </div>

            <div className="report-table-container">
                {reportData.length === 0 ? (
                    <p className="empty-state">Nenhum dado encontrado para o período e filtros selecionados.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID Produto</th>
                                <th>Nome Produto</th>
                                <th>Código de Barras</th>
                                <th>Qtd. Vendida</th>
                                <th>Receita Total</th>
                                <th>Custo Total</th>
                                <th>Lucro Bruto</th>
                                <th>Margem (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map(item => (
                                <tr key={item.product_id}>
                                    <td>{item.product_id}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.barcode}</td>
                                    <td>{item.total_quantity_sold}</td>
                                    <td>R$ {item.total_revenue.toFixed(2)}</td>
                                    <td>R$ {item.total_cost.toFixed(2)}</td>
                                    <td>R$ {item.gross_profit.toFixed(2)}</td>
                                    <td>{item.profit_margin_percentage.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductProfitabilityReportPage;
