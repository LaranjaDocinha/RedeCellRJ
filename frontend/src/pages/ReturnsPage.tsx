import React, { useState, useEffect } from 'react';
import { ReturnList } from '../components/ReturnList';
import { ReturnForm } from '../components/ReturnForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface Return {
  id: number;
  sale_id: number;
  return_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refund_amount: number;
  items?: any[];
}

interface ReturnFormData {
  sale_id: number;
  reason?: string;
  items: Array<{ product_id: number; variation_id: number; quantity: number }>;
}

const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [editingReturn, setEditingReturn] = useState<Return | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const { addToast } = useNotification();

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await fetch('/api/returns', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setReturns(data);
    } catch (error: any) {
      console.error("Error fetching returns:", error);
      addToast(`Failed to fetch returns: ${error.message}`, 'error');
    }
  };

  const handleCreateReturn = async (returnData: ReturnFormData) => {
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(returnData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchReturns();
      addToast('Return created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating return:", error);
      addToast(`Failed to create return: ${error.message}`, 'error');
    }
  };

  const handleUpdateReturn = async (id: number, returnData: Partial<ReturnFormData>) => {
    try {
      const response = await fetch(`/api/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(returnData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingReturn(undefined);
      setShowForm(false);
      fetchReturns();
      addToast('Return updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating return:", error);
      addToast(`Failed to update return: ${error.message}`, 'error');
    }
  };

  const handleDeleteReturn = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this return?')) return;
    try {
      const response = await fetch(`/api/returns/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchReturns();
      addToast('Return deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting return:", error);
      addToast(`Failed to delete return: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const returnToEdit = returns.find((r) => r.id === id);
    if (returnToEdit) {
      setEditingReturn(returnToEdit);
      setShowForm(true);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'pending' | 'approved' | 'rejected' | 'completed') => {
    try {
      const response = await fetch(`/api/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      fetchReturns();
      addToast('Return status updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating return status:", error);
      addToast(`Failed to update return status: ${error.message}`, 'error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Return Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Initiate New Return
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingReturn ? 'Edit Return' : 'Initiate New Return'}
          </h2>
          <ReturnForm
            initialData={editingReturn}
            onSubmit={(data) => {
              if (editingReturn) {
                handleUpdateReturn(editingReturn.id, data);
              } else {
                handleCreateReturn(data);
              }
            }}
            onCancel={() => {
              setEditingReturn(undefined);
              setShowForm(false);
            }}
          />
        </div>
      )}

      <ReturnList
        returns={returns}
        onViewDetails={handleEditClick} // Using edit click to view details for now
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default ReturnsPage;