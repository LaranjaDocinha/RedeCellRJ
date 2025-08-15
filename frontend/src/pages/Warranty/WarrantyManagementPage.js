import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Assuming react-hook-form is used for forms
import './WarrantyManagementPage.scss'; // For page-specific styling

const WarrantyManagementPage = () => {
    const [warranties, setWarranties] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedWarranty, setSelectedWarranty] = useState(null); // For editing

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        setWarranties([
            { id: 1, customerName: 'João Silva', productName: 'Smartphone X', serialNumber: 'SN12345', startDate: '2024-01-01', endDate: '2025-01-01', status: 'Ativa' },
            { id: 2, customerName: 'Maria Oliveira', productName: 'Notebook Pro', serialNumber: 'SN67890', startDate: '2023-06-15', endDate: '2024-06-15', status: 'Expirada' },
        ]);
    }, []);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const handleAddWarranty = () => {
        setSelectedWarranty(null);
        reset();
        setIsFormVisible(true);
    };

    const handleEditWarranty = (warranty) => {
        setSelectedWarranty(warranty);
        setValue('customerName', warranty.customerName);
        setValue('productName', warranty.productName);
        setValue('serialNumber', warranty.serialNumber);
        setValue('startDate', warranty.startDate);
        setValue('endDate', warranty.endDate);
        setValue('status', warranty.status);
        setIsFormVisible(true);
    };

    const handleCancelForm = () => {
        setIsFormVisible(false);
        setSelectedWarranty(null);
        reset();
    };

    const onSubmit = (data) => {
        if (selectedWarranty) {
            // Update existing warranty
            setWarranties(warranties.map(w => w.id === selectedWarranty.id ? { ...w, ...data } : w));
        } else {
            // Add new warranty
            setWarranties([...warranties, { id: warranties.length + 1, ...data }]);
        }
        handleCancelForm();
    };

    return (
        <div className="warranty-management-page">
            <div className="page-header">
                <h1>Gestão de Garantias</h1>
                <button className="btn btn-primary" onClick={handleAddWarranty}>Registrar Nova Garantia</button>
            </div>

            {isFormVisible && (
                <div className="warranty-form-container">
                    <h2>{selectedWarranty ? 'Editar Garantia' : 'Registrar Nova Garantia'}</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="customerName">Nome do Cliente:</label>
                            <input
                                type="text"
                                id="customerName"
                                {...register('customerName', { required: 'Nome do cliente é obrigatório' })}
                            />
                            {errors.customerName && <span className="error-message">{errors.customerName.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="productName">Nome do Produto:</label>
                            <input
                                type="text"
                                id="productName"
                                {...register('productName', { required: 'Nome do produto é obrigatório' })}
                            />
                            {errors.productName && <span className="error-message">{errors.productName.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="serialNumber">Número de Série:</label>
                            <input
                                type="text"
                                id="serialNumber"
                                {...register('serialNumber', { required: 'Número de série é obrigatório' })}
                            />
                            {errors.serialNumber && <span className="error-message">{errors.serialNumber.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="startDate">Data de Início:</label>
                            <input
                                type="date"
                                id="startDate"
                                {...register('startDate', { required: 'Data de início é obrigatória' })}
                            />
                            {errors.startDate && <span className="error-message">{errors.startDate.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">Data de Término:</label>
                            <input
                                type="date"
                                id="endDate"
                                {...register('endDate', { required: 'Data de término é obrigatória' })}
                            />
                            {errors.endDate && <span className="error-message">{errors.endDate.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status:</label>
                            <select
                                id="status"
                                {...register('status', { required: 'Status é obrigatório' })}
                            >
                                <option value="Ativa">Ativa</option>
                                <option value="Expirada">Expirada</option>
                                <option value="Pendente">Pendente</option>
                            </select>
                            {errors.status && <span className="error-message">{errors.status.message}</span>}
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar Garantia</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="warranties-list">
                <h2>Garantias Registradas</h2>
                {warranties.length === 0 ? (
                    <p className="empty-state">Nenhuma garantia registrada.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Produto</th>
                                <th>Número de Série</th>
                                <th>Início</th>
                                <th>Término</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warranties.map(warranty => (
                                <tr key={warranty.id}>
                                    <td>{warranty.customerName}</td>
                                    <td>{warranty.productName}</td>
                                    <td>{warranty.serialNumber}</td>
                                    <td>{warranty.startDate}</td>
                                    <td>{warranty.endDate}</td>
                                    <td><span className={`status-badge status-${warranty.status.toLowerCase()}`}>{warranty.status}</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-info" onClick={() => handleEditWarranty(warranty)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default WarrantyManagementPage;
