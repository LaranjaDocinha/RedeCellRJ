import React, { useState, useEffect } from 'react';
import { BranchList } from '../components/BranchList';
import { BranchForm } from '../components/BranchForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingBranch, setEditingBranch] = useState<Branch | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/branches', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBranches(data);
    } catch (error: any) {
      console.error("Error fetching branches:", error);
      addNotification(`Failed to fetch branches: ${error.message}`, 'error');
    }
  };

  const handleCreateBranch = async (branchData: Omit<Branch, 'id'>) => {
    try {
      const response = await fetch('/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(branchData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchBranches();
      addNotification('Branch created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating branch:", error);
      addNotification(`Failed to create branch: ${error.message}`, 'error');
    }
  };

  const handleUpdateBranch = async (id: number, branchData: Omit<Branch, 'id'>) => {
    try {
      const response = await fetch(`/branches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(branchData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingBranch(undefined);
      setShowForm(false);
      fetchBranches();
      addNotification('Branch updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating branch:", error);
      addNotification(`Failed to update branch: ${error.message}`, 'error');
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;
    try {
      const response = await fetch(`/branches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchBranches();
      addNotification('Branch deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      addNotification(`Failed to delete branch: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const branchToEdit = branches.find((b) => b.id === id);
    if (branchToEdit) {
      setEditingBranch(branchToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingBranch(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Branch Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Branch
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingBranch ? 'Edit Branch' : 'Add New Branch'}
          </h2>
          <BranchForm
            initialData={editingBranch}
            onSubmit={(data) => {
              if (editingBranch) {
                handleUpdateBranch(editingBranch.id, data);
              } else {
                handleCreateBranch(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <BranchList
        branches={branches}
        onEdit={handleEditClick}
        onDelete={handleDeleteBranch}
      />
    </div>
  );
};

export default BranchesPage;
