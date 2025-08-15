import React, { useState, useEffect } from 'react';
import LeadCard from '../components/Leads/LeadCard'; // Assuming LeadCard is in components/Leads
import StandardModal from '../components/Common/StandardModal'; // Assuming StandardModal is in components/Common
import { useForm } from 'react-hook-form'; // Assuming react-hook-form is used for forms
import './Leads.scss'; // For page-specific styling

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null); // For editing or viewing details

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        setLeads([
            {
                id: 1,
                name: 'João Silva',
                email: 'joao.silva@example.com',
                phone: '(11) 98765-4321',
                source: 'Website',
                status: 'Novo',
                notes: 'Interessado em reparo de celular.',
                created_at: '2023-01-01T10:00:00Z',
                updated_at: '2023-01-01T10:00:00Z',
            },
            {
                id: 2,
                name: 'Maria Oliveira',
                email: 'maria.o@example.com',
                phone: '(21) 91234-5678',
                source: 'Indicação',
                status: 'Qualificado',
                notes: 'Pronta para fechar negócio.',
                created_at: '2023-02-10T14:30:00Z',
                updated_at: '2023-02-15T11:00:00Z',
            },
            {
                id: 3,
                name: 'Carlos Souza',
                email: 'carlos.s@example.com',
                phone: '(31) 99876-5432',
                source: 'Telefone',
                status: 'Convertido',
                notes: 'Convertido em venda #12345.',
                created_at: '2023-03-05T09:00:00Z',
                updated_at: '2023-03-08T16:00:00Z',
            },
        ]);
    }, []);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const handleCardClick = (lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLead(null);
        reset(); // Reset form fields when modal closes
    };

    const onSubmit = (data) => {
        // Here you would typically send data to your backend API
        // For now, just close the modal
        handleCloseModal();
    };

    return (
        <div className="leads-page">
            <div className="page-header">
                <h1>Gestão de Leads</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Adicionar Novo Lead</button>
            </div>

            <div className="leads-list">
                {leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={handleCardClick} />
                ))}
            </div>

            <StandardModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedLead ? 'Detalhes do Lead' : 'Adicionar Novo Lead'}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="name">Nome:</label>
                        <input
                            type="text"
                            id="name"
                            {...register('name', { required: 'Nome é obrigatório' })}
                            defaultValue={selectedLead?.name || ''}
                        />
                        {errors.name && <span className="error-message">{errors.name.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            {...register('email', { required: 'Email é obrigatório' })}
                            defaultValue={selectedLead?.email || ''}
                        />
                        {errors.email && <span className="error-message">{errors.email.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Telefone:</label>
                        <input
                            type="text"
                            id="phone"
                            {...register('phone', { required: 'Telefone é obrigatório' })}
                            defaultValue={selectedLead?.phone || ''}
                        />
                        {errors.phone && <span className="error-message">{errors.phone.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="source">Origem:</label>
                        <input
                            type="text"
                            id="source"
                            {...register('source', { required: 'Origem é obrigatória' })}
                            defaultValue={selectedLead?.source || ''}
                        />
                        {errors.source && <span className="error-message">{errors.source.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            {...register('status', { required: 'Status é obrigatório' })}
                            defaultValue={selectedLead?.status || 'Novo'}
                        >
                            <option value="Novo">Novo</option>
                            <option value="Qualificado">Qualificado</option>
                            <option value="Contato">Contato</option>
                            <option value="Convertido">Convertido</option>
                            <option value="Perdido">Perdido</option>
                        </select>
                        {errors.status && <span className="error-message">{errors.status.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Notas:</label>
                        <textarea
                            id="notes"
                            {...register('notes')}
                            defaultValue={selectedLead?.notes || ''}
                        ></textarea>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </StandardModal>
        </div>
    );
};

export default Leads;