import React, { useState, useEffect } from 'react';
import { SupplierList } from '../components/SupplierList';
import { SupplierForm } from '../components/SupplierForm';

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers'); // Assuming proxy is set up for /suppliers to backend
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleCreateSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setShowForm(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Error creating supplier:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleUpdateSupplier = async (id: number, supplierData: Omit<Supplier, 'id'>) => {
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setEditingSupplier(undefined);
      setShowForm(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Error updating supplier:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }
    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleEditClick = (id: number) => {
    const supplierToEdit = suppliers.find((s) => s.id === id);
    if (supplierToEdit) {
      setEditingSupplier(supplierToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingSupplier(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supplier Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Supplier
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <SupplierForm
            initialData={editingSupplier}
            onSubmit={(data) => {
              if (editingSupplier) {
                handleUpdateSupplier(editingSupplier.id, data);
              } else {
                handleCreateSupplier(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <SupplierList
        suppliers={suppliers}
        onEdit={handleEditClick}
        onDelete={handleDeleteSupplier}
      />
    </div>
  );
};

export default SuppliersPage;