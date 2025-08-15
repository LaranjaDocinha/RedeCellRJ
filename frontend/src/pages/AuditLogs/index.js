import React, { useState, useEffect } from 'react';
import './AuditLogs.scss'; // For page-specific styling

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [userNameFilter, setUserNameFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    // Dummy data for now, replace with API calls later
    useEffect(() => {
        // Simulate fetching data from /api/reports/audit-logs
        const dummyLogs = [
            { id: 1, user_name: 'admin', description: 'Login bem-sucedido', timestamp: '2024-01-01T10:00:00Z' },
            { id: 2, user_name: 'joao.s', description: 'Produto "Smartphone X" criado', timestamp: '2024-01-01T10:30:00Z' },
            { id: 3, user_name: 'admin', description: 'Usuário "joao.s" atualizado', timestamp: '2024-01-02T11:00:00Z' },
            { id: 4, user_name: 'maria.o', description: 'Venda #123 registrada', timestamp: '2024-01-03T14:00:00Z' },
            { id: 5, user_name: 'admin', description: 'Login falhou', timestamp: '2024-01-03T14:05:00Z' },
        ];

        let filteredLogs = dummyLogs;

        if (userNameFilter) {
            filteredLogs = filteredLogs.filter(log =>
                log.user_name.toLowerCase().includes(userNameFilter.toLowerCase())
            );
        }

        if (startDateFilter) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) >= new Date(startDateFilter)
            );
        }

        if (endDateFilter) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp) <= new Date(endDateFilter)
            );
        }

        setLogs(filteredLogs);
    }, [userNameFilter, startDateFilter, endDateFilter]);

    const handleApplyFilters = () => {
        // This will trigger the useEffect to re-filter dummy data or make API call
    };

    return (
        <div className="audit-logs-page">
            <div className="page-header">
                <h1>Logs de Auditoria</h1>
            </div>

            <div className="filters-card">
                <div className="form-group">
                    <label htmlFor="userNameFilter">Nome de Usuário:</label>
                    <input type="text" id="userNameFilter" value={userNameFilter} onChange={(e) => setUserNameFilter(e.target.value)} placeholder="Filtrar por usuário" />
                </div>
                <div className="form-group">
                    <label htmlFor="startDateFilter">Data de Início:</label>
                    <input type="date" id="startDateFilter" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="endDateFilter">Data de Fim:</label>
                    <input type="date" id="endDateFilter" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleApplyFilters}>Aplicar Filtros</button>
            </div>

            <div className="logs-table-container">
                {logs.length === 0 ? (
                    <p className="empty-state">Nenhum log de auditoria encontrado com os filtros aplicados.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuário</th>
                                <th>Descrição</th>
                                <th>Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td>{log.id}</td>
                                    <td>{log.user_name}</td>
                                    <td>{log.description}</td>
                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;