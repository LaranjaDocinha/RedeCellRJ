import React, { useState, useEffect } from 'react';
import { ProductKitList } from '../components/ProductKitList';
import { ProductKitForm } from '../components/ProductKitForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface ProductKit {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  items?: Array<{ product_id: number; variation_id: number; quantity: number }>;
}

interface ProductKitFormData {
  name: string;
  description?: string;
  price: number;
  is_active?: boolean;
  items: Array<{ product_id: number; variation_id: number; quantity: number }>;
}

const ProductKitsPage: React.FC = () => {
  const [kits, setKits] = useState<ProductKit[]>([]);
  const [editingKit, setEditingKit] = useState<ProductKit | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      const response = await fetch('/api/product-kits', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setKits(data);
    } catch (error: any) {
      console.error("Error fetching product kits:", error);
      addNotification(`Failed to fetch product kits: ${error.message}`, 'error');
    }
  };

  const handleCreateKit = async (kitData: ProductKitFormData) => {
    try {
      const response = await fetch('/api/product-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(kitData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchKits();
      addNotification('Product kit created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating product kit:", error);
      addNotification(`Failed to create product kit: ${error.message}`, 'error');
    }
  };

  const handleUpdateKit = async (id: number, kitData: ProductKitFormData) => {
    try {
      const response = await fetch(`/api/product-kits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(kitData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingKit(undefined);
      setShowForm(false);
      fetchKits();
      addNotification('Product kit updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating product kit:", error);
      addNotification(`Failed to update product kit: ${error.message}`, 'error');
    }
  };

  const handleDeleteKit = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product kit?')) return;
    try {
      const response = await fetch(`/api/product-kits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchKits();
      addNotification('Product kit deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting product kit:", error);
      addNotification(`Failed to delete product kit: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const kitToEdit = kits.find((k) => k.id === id);
    if (kitToEdit) {
      setEditingKit(kitToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingKit(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Kit Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Kit
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingKit ? 'Edit Product Kit' : 'Add New Kit'}
          </h2>
          <ProductKitForm
            initialData={editingKit}
            onSubmit={(data) => {
              if (editingKit) {
                handleUpdateKit(editingKit.id, data);
              } else {
                handleCreateKit(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <ProductKitList
        kits={kits}
        onEdit={handleEditClick}
        onDelete={handleDeleteKit}
      />
    </div>
  );
};

export default ProductKitsPage;