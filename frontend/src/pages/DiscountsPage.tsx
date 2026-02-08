
import React, { useState, useEffect } from 'react';
import { DiscountList } from '../components/DiscountList';
import { DiscountForm } from '../components/DiscountForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { StyledPageContainer, StyledPageTitle } from './AuditLogsPage.styled'; // Reutilizando componentes estilizados
import { Button } from '../components/Button'; // Importar o componente Button
import Loading from '../components/Loading'; // Importar o componente Loading
import { StyledEmptyState } from '../components/AuditLogList.styled'; // Reutilizando StyledEmptyState
import { FaTag } from 'react-icons/fa'; // Ícone para estado vazio (reutilizando FaTag de CouponsPage)

interface Discount {
  id: number;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  start_date: string;
  end_date?: string;
  min_purchase_amount?: number;
  max_uses?: number;
  uses_count: number;
  is_active: boolean;
}

const DiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [editingDiscount, setEditingDiscount] = useState<Discount | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discounts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDiscounts(data);
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      showNotification(`Failed to fetch discounts: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async (discountData: Omit<Discount, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(discountData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchDiscounts();
      showNotification('Discount created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating discount:", error);
      showNotification(`Failed to create discount: ${error.message}`, 'error');
    }
  };

  const handleUpdateDiscount = async (id: number, discountData: Omit<Discount, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(discountData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingDiscount(undefined);
      setShowForm(false);
      fetchDiscounts();
      showNotification('Discount updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating discount:", error);
      showNotification(`Failed to update discount: ${error.message}`, 'error');
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchDiscounts();
      showNotification('Discount deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      showNotification(`Failed to delete discount: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const discountToEdit = discounts.find((d) => d.id === id);
    if (discountToEdit) {
      setEditingDiscount(discountToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingDiscount(undefined);
    setShowForm(false);
  };

  return (
    <StyledPageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledPageTitle
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Discount Management
      </StyledPageTitle>

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              color="primary"
              label="Add New Discount"
            />
          </div>

          {showForm && (
            <div className="mb-8">
              <h2 className="text-xl font-normal mb-3">
                {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
              </h2>
              <DiscountForm
                initialData={editingDiscount}
                onSubmit={(data) => {
                  if (editingDiscount) {
                    handleUpdateDiscount(editingDiscount.id, data);
                  } else {
                    handleCreateDiscount(data);
                  }
                }}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          {discounts.length === 0 && !showForm ? (
            <StyledEmptyState
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaTag />
              <p>No discounts found. Click "Add New Discount" to get started!</p>
            </StyledEmptyState>
          ) : (
            <DiscountList
              discounts={discounts}
              onEdit={handleEditClick}
              onDelete={handleDeleteDiscount}
            />
          )}
        </>
      )}
    </StyledPageContainer>
  );
};

export default DiscountsPage;
