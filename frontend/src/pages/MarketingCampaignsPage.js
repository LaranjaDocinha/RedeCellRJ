import React, { useState, useEffect } from 'react';
import StandardModal from '../components/Common/StandardModal'; // Assuming StandardModal is in components/Common
import { useForm } from 'react-hook-form'; // Assuming react-hook-form is used for forms
import './MarketingCampaignsPage.scss'; // For page-specific styling

const MarketingCampaignsPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null); // For editing or viewing details

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        setCampaigns([
            { id: 1, name: 'Campanha de Boas-Vindas', type: 'Email', status: 'Sent', scheduled_date_time: '2024-01-10T10:00:00Z' },
            { id: 2, name: 'Promoção de Verão', type: 'SMS', status: 'Scheduled', scheduled_date_time: '2024-08-01T14:00:00Z' },
            { id: 3, name: 'Black Friday', type: 'Email', status: 'Draft', scheduled_date_time: null },
        ]);
    }, []);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const handleAddCampaign = () => {
        setSelectedCampaign(null);
        reset();
        setIsModalOpen(true);
    };

    const handleEditCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setValue('name', campaign.name);
        setValue('type', campaign.type);
        setValue('message_template', campaign.message_template); // Assuming this field exists
        setValue('scheduled_date_time', campaign.scheduled_date_time ? new Date(campaign.scheduled_date_time).toISOString().slice(0, 16) : '');
        setValue('status', campaign.status);
        setIsModalOpen(true);
    };

    const handleDeleteCampaign = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
            // Implement API call to delete campaign
            console.log('Deleting campaign with ID:', id);
            setCampaigns(campaigns.filter(c => c.id !== id)); // Optimistic update
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCampaign(null);
        reset();
    };

    const onSubmit = (data) => {
        console.log('Form submitted:', data);
        if (selectedCampaign) {
            // Update existing campaign
            setCampaigns(campaigns.map(c => c.id === selectedCampaign.id ? { ...c, ...data } : c));
        } else {
            // Add new campaign
            setCampaigns([...campaigns, { id: campaigns.length + 1, ...data }]);
        }
        handleCloseModal();
    };

    return (
        <div className="marketing-campaigns-page">
            <div className="page-header">
                <h1>Gestão de Campanhas de Marketing</h1>
                <button className="btn btn-primary" onClick={handleAddCampaign}>Criar Nova Campanha</button>
            </div>

            <div className="campaigns-list">
                {campaigns.length === 0 ? (
                    <p className="empty-state">Nenhuma campanha de marketing encontrada.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Agendado para</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(campaign => (
                                <tr key={campaign.id}>
                                    <td>{campaign.name}</td>
                                    <td>{campaign.type}</td>
                                    <td><span className={`status-badge status-${campaign.status.toLowerCase()}`}>{campaign.status}</span></td>
                                    <td>{campaign.scheduled_date_time ? new Date(campaign.scheduled_date_time).toLocaleString() : 'N/A'}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info" onClick={() => handleEditCampaign(campaign)}>Editar</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCampaign(campaign.id)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <StandardModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedCampaign ? 'Editar Campanha de Marketing' : 'Criar Nova Campanha de Marketing'}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="name">Nome da Campanha:</label>
                        <input
                            type="text"
                            id="name"
                            {...register('name', { required: 'Nome da campanha é obrigatório' })}
                        />
                        {errors.name && <span className="error-message">{errors.name.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Tipo:</label>
                        <select
                            id="type"
                            {...register('type', { required: 'Tipo é obrigatório' })}
                        >
                            <option value="">Selecione...</option>
                            <option value="Email">Email</option>
                            <option value="SMS">SMS</option>
                        </select>
                        {errors.type && <span className="error-message">{errors.type.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="message_template">Template da Mensagem:</label>
                        <textarea
                            id="message_template"
                            {...register('message_template', { required: 'Template da mensagem é obrigatório' })}
                        ></textarea>
                        {errors.message_template && <span className="error-message">{errors.message_template.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="scheduled_date_time">Agendado para:</label>
                        <input
                            type="datetime-local"
                            id="scheduled_date_time"
                            {...register('scheduled_date_time')}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            {...register('status', { required: 'Status é obrigatório' })}
                        >
                            <option value="Draft">Rascunho</option>
                            <option value="Scheduled">Agendada</option>
                            <option value="Sent">Enviada</option>
                            <option value="Failed">Falhou</option>
                            <option value="Cancelled">Cancelada</option>
                        </select>
                        {errors.status && <span className="error-message">{errors.status.message}</span>}
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar Campanha</button>
                    </div>
                </form>
            </StandardModal>
        </div>
    );
};

export default MarketingCampaignsPage;
