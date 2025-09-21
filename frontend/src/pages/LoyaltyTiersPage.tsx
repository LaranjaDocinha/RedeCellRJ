import React, { useState, useEffect } from 'react';
import { LoyaltyTierList } from '../components/LoyaltyTierList';
import { LoyaltyTierForm } from '../components/LoyaltyTierForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  description?: string;
  benefits?: any; // JSONB
}

const LoyaltyTiersPage: React.FC = () => {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await fetch('/loyalty-tiers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTiers(data);
    } catch (error: any) {
      console.error("Error fetching loyalty tiers:", error);
      addNotification(`Failed to fetch loyalty tiers: ${error.message}`, 'error');
    }
  };

  const handleCreateTier = async (tierData: Omit<LoyaltyTier, 'id'>) => {
    try {
      const response = await fetch('/loyalty-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(tierData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchTiers();
      addNotification('Loyalty tier created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating loyalty tier:", error);
      addNotification(`Failed to create loyalty tier: ${error.message}`, 'error');
    }
  };

  const handleUpdateTier = async (id: number, tierData: Omit<LoyaltyTier, 'id'>) => {
    try {
      const response = await fetch(`/loyalty-tiers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(tierData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingTier(undefined);
      setShowForm(false);
      fetchTiers();
      addNotification('Loyalty tier updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating loyalty tier:", error);
      addNotification(`Failed to update loyalty tier: ${error.message}`, 'error');
    }
  };

  const handleDeleteTier = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this loyalty tier?')) return;
    try {
      const response = await fetch(`/loyalty-tiers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchTiers();
      addNotification('Loyalty tier deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting loyalty tier:", error);
      addNotification(`Failed to delete loyalty tier: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const tierToEdit = tiers.find((t) => t.id === id);
    if (tierToEdit) {
      setEditingTier(tierToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingTier(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Loyalty Tier Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Tier
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingTier ? 'Edit Loyalty Tier' : 'Add New Tier'}
          </h2>
          <LoyaltyTierForm
            initialData={editingTier}
            onSubmit={(data) => {
              if (editingTier) {
                handleUpdateTier(editingTier.id, data);
              } else {
                handleCreateTier(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <LoyaltyTierList
        tiers={tiers}
        onEdit={handleEditClick}
        onDelete={handleDeleteTier}
      />
    </div>
  );
};

export default LoyaltyTiersPage;
