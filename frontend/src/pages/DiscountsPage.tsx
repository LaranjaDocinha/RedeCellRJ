import React, { useState, useEffect } from 'react';
import { DiscountList } from '../components/DiscountList';
import { DiscountForm } from '../components/DiscountForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

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
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/discounts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDiscounts(data);
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      addNotification(`Failed to fetch discounts: ${error.message}`, 'error');
    }
  };

  const handleCreateDiscount = async (discountData: Omit<Discount, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch('/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(discountData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchDiscounts();
      addNotification('Discount created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating discount:", error);
      addNotification(`Failed to create discount: ${error.message}`, 'error');
    }
  };

  const handleUpdateDiscount = async (id: number, discountData: Omit<Discount, 'id' | 'uses_count'>) => {
    try {
      const response = await fetch(`/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(discountData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingDiscount(undefined);
      setShowForm(false);
      fetchDiscounts();
      addNotification('Discount updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating discount:", error);
      addNotification(`Failed to update discount: ${error.message}`, 'error');
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    try {
      const response = await fetch(`/discounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchDiscounts();
      addNotification('Discount deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      addNotification(`Failed to delete discount: ${error.message}`, 'error');
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Discount Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Discount
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
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

      <DiscountList
        discounts={discounts}
        onEdit={handleEditClick}
        onDelete={handleDeleteDiscount}
      />
    </div>
  );
};

export default DiscountsPage;
