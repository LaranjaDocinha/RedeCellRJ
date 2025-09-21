import React, { useState, useEffect } from 'react';
import { CustomerList } from '../components/CustomerList';
import { CustomerForm } from '../components/CustomerForm';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/customers'); // Assuming proxy is set up for /customers to backend
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleCreateCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const response = await fetch('/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error creating customer:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleUpdateCustomer = async (id: number, customerData: Omit<Customer, 'id'>) => {
    try {
      const response = await fetch(`/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      setEditingCustomer(undefined);
      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    try {
      const response = await fetch(`/customers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      // TODO: Display user-friendly error message
    }
  };

  const handleEditClick = (id: number) => {
    const customerToEdit = customers.find((c) => c.id === id);
    if (customerToEdit) {
      setEditingCustomer(customerToEdit);
      setShowForm(true);
    }
  };

  const handleCancelForm = () => {
    setEditingCustomer(undefined);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Customer
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <CustomerForm
            initialData={editingCustomer}
            onSubmit={(data) => {
              if (editingCustomer) {
                handleUpdateCustomer(editingCustomer.id, data);
              } else {
                handleCreateCustomer(data);
              }
            }}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      <CustomerList
        customers={customers}
        onEdit={handleEditClick}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
};

export default CustomersPage;
