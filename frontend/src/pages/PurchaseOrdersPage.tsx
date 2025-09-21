import React, { useState, useEffect } from 'react';
import { PurchaseOrderList } from '../components/PurchaseOrderList';
import { PurchaseOrderForm } from '../components/PurchaseOrderForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationProvider';

interface PurchaseOrder {
  id: number;
  supplier_id: number;
  order_date: string;
  expected_delivery_date?: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  items?: Array<{ product_id: number; variation_id: number; quantity: number; unit_price: number }>;
}

interface PurchaseOrderFormData {
  supplier_id: number;
  expected_delivery_date?: string;
  status?: 'pending' | 'ordered' | 'received' | 'cancelled';
  items: Array<{ product_id: number; variation_id: number; quantity: number; unit_price: number }>;
}

interface Supplier {
  id: number;
  name: string;
}

const PurchaseOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/purchase-orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setOrders(data);
    } catch (error: any) {
      console.error("Error fetching purchase orders:", error);
      addNotification(`Failed to fetch purchase orders: ${error.message}`, 'error');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSuppliers(data);
    } catch (error: any) {
      console.error("Error fetching suppliers:", error);
      addNotification(`Failed to fetch suppliers: ${error.message}`, 'error');
    }
  };

  const handleCreateOrder = async (orderData: PurchaseOrderFormData) => {
    try {
      const response = await fetch('/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setShowForm(false);
      fetchOrders();
      addNotification('Purchase order created successfully!', 'success');
    } catch (error: any) {
      console.error("Error creating purchase order:", error);
      addNotification(`Failed to create purchase order: ${error.message}`, 'error');
    }
  };

  const handleUpdateOrder = async (id: number, orderData: PurchaseOrderFormData) => {
    try {
      const response = await fetch(`/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setEditingOrder(undefined);
      setShowForm(false);
      fetchOrders();
      addNotification('Purchase order updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating purchase order:", error);
      addNotification(`Failed to update purchase order: ${error.message}`, 'error');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
    try {
      const response = await fetch(`/purchase-orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchOrders();
      addNotification('Purchase order deleted successfully!', 'success');
    } catch (error: any) {
      console.error("Error deleting purchase order:", error);
      addNotification(`Failed to delete purchase order: ${error.message}`, 'error');
    }
  };

  const handleEditClick = (id: number) => {
    const orderToEdit = orders.find((o) => o.id === id);
    if (orderToEdit) {
      setEditingOrder(orderToEdit);
      setShowForm(true);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'pending' | 'ordered' | 'received' | 'cancelled') => {
    try {
      const response = await fetch(`/purchase-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      fetchOrders();
      addNotification('Purchase order status updated successfully!', 'success');
    } catch (error: any) {
      console.error("Error updating purchase order status:", error);
      addNotification(`Failed to update purchase order status: ${error.message}`, 'error');
    }
  };

  const handleReceiveItems = async (id: number) => {
    // For simplicity, assume all items in the order are received
    // In a real app, you'd have a form to specify quantities received
    const orderToReceive = orders.find(o => o.id === id);
    if (!orderToReceive || !orderToReceive.items) {
      addNotification('Order not found or has no items to receive.', 'warning');
      return;
    }

    const receivedItemsPayload = orderToReceive.items.map(item => ({
      variation_id: item.variation_id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`/purchase-orders/${id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items: receivedItemsPayload }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      addNotification('Items received and stock updated!', 'success');
      fetchOrders();
    } catch (error: any) {
      console.error("Error receiving items:", error);
      addNotification(`Failed to receive items: ${error.message}`, 'error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Purchase Order Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Purchase Order
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            {editingOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
          </h2>
          <PurchaseOrderForm
            initialData={editingOrder}
            onSubmit={(data) => {
              if (editingOrder) {
                handleUpdateOrder(editingOrder.id, data);
              } else {
                handleCreateOrder(data);
              }
            }}
            onCancel={() => {
              setEditingOrder(undefined);
              setShowForm(false);
            }}
            suppliers={suppliers}
          />
        </div>
      )}

      <PurchaseOrderList
        orders={orders}
        onViewDetails={handleEditClick} // Using edit click to view details for now
        onUpdateStatus={handleUpdateStatus}
        onReceiveItems={handleReceiveItems}
      />
    </div>
  );
};

export default PurchaseOrdersPage;
