import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Assuming react-router-dom for getting customer ID from URL
import './SalesHistory.scss'; // For page-specific styling

const SalesHistory = () => {
    const { customerId } = useParams(); // Get customerId from URL params
    const [salesHistory, setSalesHistory] = useState([]);
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        // Dummy data for now, replace with API calls later
        // In a real application, you'd fetch data from /api/customers/:customerId/sales-history
        const dummySales = [
            {
                id: 101,
                sale_date: '2024-01-15',
                total_amount: 150.00,
                description: 'Reparo de tela de celular',
                items: [
                    { item_id: 1, product_name: 'Tela iPhone X', quantity: 1, price: 100.00 },
                    { item_id: 2, product_name: 'Mão de obra', quantity: 1, price: 50.00 },
                ],
            },
            {
                id: 102,
                sale_date: '2024-02-20',
                total_amount: 250.50,
                description: 'Venda de acessório e serviço',
                items: [
                    { item_id: 3, product_name: 'Capa para celular', quantity: 1, price: 30.50 },
                    { item_id: 4, product_name: 'Película de vidro', quantity: 1, price: 20.00 },
                    { item_id: 5, product_name: 'Instalação', quantity: 1, price: 200.00 },
                ],
            },
        ];

        // Simulate fetching customer name
        setCustomerName(`Cliente ${customerId}`); // Replace with actual fetch

        setSalesHistory(dummySales);
    }, [customerId]);

    return (
        <div className="sales-history-page">
            <div className="page-header">
                <h1>Histórico de Vendas para {customerName}</h1>
            </div>

            <div className="sales-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID da Venda</th>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Valor Total</th>
                            <th>Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesHistory.map(sale => (
                            <React.Fragment key={sale.id}>
                                <tr>
                                    <td>{sale.id}</td>
                                    <td>{sale.sale_date}</td>
                                    <td>{sale.description}</td>
                                    <td>R$ {sale.total_amount.toFixed(2)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info">Ver Itens</button>
                                    </td>
                                </tr>
                                {/* Optional: Expandable row for items */}
                                {/* <tr>
                                    <td colSpan="5">
                                        <ul>
                                            {sale.items.map(item => (
                                                <li key={item.item_id}>{item.product_name} ({item.quantity}x) - R$ {item.price.toFixed(2)}</li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr> */}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                {salesHistory.length === 0 && (
                    <p className="empty-state">Nenhum histórico de vendas encontrado para este cliente.</p>
                )}
            </div>
        </div>
    );
};

export default SalesHistory;
