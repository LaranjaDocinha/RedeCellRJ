import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/Loading';
import Table from '../components/Table';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled';
import { FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';
import { StyledEmptyState } from '../components/AuditLogList.styled';
import { Button } from '../components/Button';
import InspectionModal from '../components/InspectionModal'; // To be created

interface QuarantineItem {
  return_item_id: number;
  quantity: number;
  inspection_status: string;
  return_id: number;
  return_date: string;
  product_name: string;
  color: string;
  customer_name: string;
}

const QuarantinePage: React.FC = () => {
  const [items, setItems] = useState<QuarantineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QuarantineItem | null>(null);

  const { token } = useAuth();
  const { addToast } = useNotification();

  const fetchQuarantineItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/returns/quarantine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
      addToast(`Failed to fetch quarantine items: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addToast]);

  useEffect(() => {
    if (token) {
      fetchQuarantineItems();
    }
  }, [token, fetchQuarantineItems]);

  const handleOpenModal = (item: QuarantineItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleInspectionSubmit = async (status: 'approved' | 'rejected', notes: string) => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/return-items/${selectedItem.return_item_id}/inspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inspection_status: status, inspection_notes: notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit inspection');
      }

      addToast('Inspection submitted successfully!', 'success');
      fetchQuarantineItems(); // Refresh the list
      handleCloseModal();
    } catch (err: any) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const columns = [
    { key: 'product_name', header: 'Produto' },
    { key: 'color', header: 'Cor' },
    { key: 'quantity', header: 'Qtd' },
    { key: 'customer_name', header: 'Cliente' },
    { key: 'return_date', header: 'Data Devolução', render: (item: QuarantineItem) => new Date(item.return_date).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: QuarantineItem) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button label="Inspecionar" size="small" onClick={() => handleOpenModal(item)} />
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  if (error) {
    return (
      <StyledEmptyState>
        <FaExclamationTriangle />
        <p>Error: {error}</p>
      </StyledEmptyState>
    );
  }

  return (
    <StyledPageContainer>
      <StyledPageTitle>Itens em Quarentena</StyledPageTitle>
      {items.length === 0 ? (
        <StyledEmptyState>
          <FaBoxOpen />
          <p>Não há itens pendentes de inspeção.</p>
        </StyledEmptyState>
      ) : (
        <Table data={items} columns={columns} />
      )}
      {isModalOpen && selectedItem && (
        <InspectionModal
          item={selectedItem}
          onClose={handleCloseModal}
          onSubmit={handleInspectionSubmit}
        />
      )}
    </StyledPageContainer>
  );
};

export default QuarantinePage;
