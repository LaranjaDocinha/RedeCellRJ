import React, { useState, useEffect } from 'react';
import StandardModal from '../components/Common/StandardModal'; // Assuming StandardModal is in components/Common
import { useForm } from 'react-hook-form'; // Assuming react-hook-form is used for forms
import './ChecklistTemplatesPage.scss'; // For page-specific styling

const ChecklistTemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null); // For editing or viewing details

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        setTemplates([
            { id: 1, name: 'Checklist de Entrada - Celular', description: 'Verificação inicial de celulares.', category: 'Celular' },
            { id: 2, name: 'Checklist de Saída - Notebook', description: 'Verificação final de notebooks.', category: 'Notebook' },
            { id: 3, name: 'Checklist de Limpeza', description: 'Checklist para limpeza de equipamentos.', category: 'Geral' },
        ]);
    }, []);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const handleAddTemplate = () => {
        setSelectedTemplate(null);
        reset();
        setIsModalOpen(true);
    };

    const handleEditTemplate = (template) => {
        setSelectedTemplate(template);
        setValue('name', template.name);
        setValue('description', template.description);
        setValue('category', template.category);
        setIsModalOpen(true);
    };

    const handleDeleteTemplate = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este template?')) {
            // Implement API call to delete template
            setTemplates(templates.filter(t => t.id !== id)); // Optimistic update
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTemplate(null);
        reset();
    };

    const onSubmit = (data) => {
        if (selectedTemplate) {
            // Update existing template
            setTemplates(templates.map(t => t.id === selectedTemplate.id ? { ...t, ...data } : t));
        } else {
            // Add new template
            setTemplates([...templates, { id: templates.length + 1, ...data }]);
        }
        handleCloseModal();
    };

    return (
        <div className="checklist-templates-page">
            <div className="page-header">
                <h1>Gerenciador de Templates de Checklist</h1>
                <button className="btn btn-primary" onClick={handleAddTemplate}>Adicionar Novo Template</button>
            </div>

            <div className="templates-list">
                {templates.length === 0 ? (
                    <p className="empty-state">Nenhum template de checklist encontrado.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(template => (
                                <tr key={template.id}>
                                    <td>{template.name}</td>
                                    <td>{template.description}</td>
                                    <td>{template.category}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info" onClick={() => handleEditTemplate(template)}>Editar</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTemplate(template.id)}>Excluir</button>
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
                title={selectedTemplate ? 'Editar Template de Checklist' : 'Adicionar Novo Template de Checklist'}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="name">Nome:</label>
                        <input
                            type="text"
                            id="name"
                            {...register('name', { required: 'Nome é obrigatório' })}
                        />
                        {errors.name && <span className="error-message">{errors.name.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Descrição:</label>
                        <textarea
                            id="description"
                            {...register('description')}
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Categoria:</label>
                        <input
                            type="text"
                            id="category"
                            {...register('category')}
                        />
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

export default ChecklistTemplatesPage;
