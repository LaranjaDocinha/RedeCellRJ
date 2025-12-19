import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import Input from '../components/Input';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled';
import Table from '../components/Table';
import { FaSearch, FaHistory } from 'react-icons/fa';
import styled from 'styled-components';

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
`;

interface HistoryEntry {
  id: number;
  action: string;
  old_status: string;
  new_status: string;
  created_at: string;
  user_id: number;
}

const SerialHistoryPage: React.FC = () => {
  const [serial, setSerial] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();
  const { token } = useAuth();

  const handleSearch = async () => {
    if (!serial) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/serialized-items/history/${serial}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Serial not found or error fetching history');
      const data = await response.json();
      setHistory(data);
    } catch (error: any) {
      addToast(error.message, 'error');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'created_at', header: 'Data/Hora', render: (row: HistoryEntry) => new Date(row.created_at).toLocaleString() },
    { key: 'action', header: 'Ação' },
    { key: 'old_status', header: 'Status Anterior' },
    { key: 'new_status', header: 'Novo Status' },
    { key: 'user_id', header: 'Usuário (ID)' },
  ];

  return (
    <StyledPageContainer>
      <StyledPageTitle>Histórico de Aparelho (IMEI)</StyledPageTitle>
      <SearchContainer>
        <Input 
          placeholder="Digite o IMEI/Serial..." 
          value={serial} 
          onChange={(e) => setSerial(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button label="Buscar" onClick={handleSearch} icon={<FaSearch />} disabled={loading} />
      </SearchContainer>

      {history.length > 0 ? (
        <Table data={history} columns={columns} />
      ) : (
        <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
          <FaHistory size={40} />
          <p>Digite um serial para ver o ciclo de vida completo.</p>
        </div>
      )}
    </StyledPageContainer>
  );
};

export default SerialHistoryPage;
