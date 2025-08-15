import React, { useState, useEffect } from 'react';
// import QuotationCard from '../components/Quotations/QuotationCard'; // Will create later
// import StandardModal from '../components/Common/StandardModal'; // Assuming StandardModal is in components/Common
// import { useForm } from 'react-hook-form'; // Assuming react-hook-form is used for forms
import './QuotationsPage.scss'; // For page-specific styling

const QuotationsPage = () => {
    const [quotations, setQuotations] = useState([]);
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedQuotation, setSelectedQuotation] = useState(null); // For editing or viewing details

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        setQuotations([
            {
                id: 1,
                customer_name: 'Cliente A',
                total_amount: 150.00,
                status: 'Draft',
                quotation_date: '2024-07-01',
            },
            {
                id: 2,
                customer_name: 'Cliente B',
                total_amount: 300.50,
                status: 'Sent',
                quotation_date: '2024-07-05',
            },
            {
                id: 3,
                customer_name: 'Cliente C',
                total_amount: 500.00,
                status: 'Approved',
                quotation_date: '2024-07-10',
            },
        ]);
    }, []);

    return (
        <div className="quotations-page">
            <div className="page-header">
                <h1>Gestão de Cotações</h1>
                <button className="btn btn-primary">Adicionar Nova Cotação</button>
            </div>

            <div className="quotations-list">
                {quotations.map(quotation => (
                    <div key={quotation.id} className="quotation-item">
                        <h3>Cotação #{quotation.id}</h3>
                        <p>Cliente: {quotation.customer_name}</p>
                        <p>Valor Total: R$ {quotation.total_amount.toFixed(2)}</p>
                        <p>Status: {quotation.status}</p>
                        <p>Data: {quotation.quotation_date}</p>
                        <button className="btn btn-sm btn-info">Ver Detalhes</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuotationsPage;
